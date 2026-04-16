// Crawlee router for the CEAC DS-160 flow.
// The default handler classifies the current page by URL (via PAGE_ORDER) and delegates
// to the corresponding module. Page modules decide whether to enqueue the next URL.

import { createPlaywrightRouter, NonRetryableError } from '@crawlee/playwright';
import { PAGE_MODULES } from './pages/index.js';
import { findPageByUrl } from './schema/pageOrder.js';
import type { DS160Applicant } from './schema/types.js';
import { detectPageState, isSessionIrrecoverable } from './engine/state.js';
import { EngineError } from './logging/errors.js';
import { classifyError } from './logging/causes.js';
import { recordFillLog, recordErrorLog, logInfo } from './logging/logger.js';
import type { PageContext } from './pages/types.js';
import { evaluateDefinitionOfDone } from './worker/dod.js';
import { captureForDiagnostics } from './lib/screenshot.js';
import { collectPageErrorContext, summarizePageError } from './logging/errorContext.js';

export interface RouterPayload {
    applicant: DS160Applicant;
    dryRun: boolean;
    applicationId?: string;
    workerId: string;
}

export function buildRouter(payload: RouterPayload) {
    const router = createPlaywrightRouter();

    const MAX_PAGE_STEPS = Number(process.env.DS160_MAX_PAGE_STEPS ?? 40);

    router.addDefaultHandler(async ({ page, log }) => {
        // Loop through DS-160 pages inside a single Crawlee request.
        // Each page module navigates the browser forward; the URL tells us which page
        // we are on now. The loop exits when: no more module fits the current URL,
        // a module throws, or we hit the safety bound.
        const visited = new Set<string>();

        for (let step = 1; step <= MAX_PAGE_STEPS; step += 1) {
            const state = await detectPageState(page);
            if (isSessionIrrecoverable(state)) {
                throw new EngineError(`Irrecoverable state: ${state}`, {
                    cause: state === 'session_timeout' ? 'session_expired' : 'challenge_detected',
                });
            }

            const currentUrl = page.url();
            const descriptor = findPageByUrl(currentUrl);
            if (!descriptor) {
                throw new EngineError(`Unknown page: ${currentUrl}`, { cause: 'unknown_page' });
            }

            // Loop guard — if the same page is reached twice without URL change we would loop
            // forever. Each page must advance the URL to something new.
            const fingerprint = `${descriptor.id}@${currentUrl}`;
            if (visited.has(fingerprint)) {
                throw new EngineError(`Loop detected — already processed ${fingerprint}`, {
                    cause: 'page_stuck',
                    pageName: descriptor.id,
                });
            }
            visited.add(fingerprint);

            const mod = PAGE_MODULES[descriptor.id];
            const ctx: PageContext = {
                page,
                data: payload.applicant,
                dryRun: payload.dryRun,
                applicationId: payload.applicationId,
            };

            log.info(`DS160 step ${step} → entering ${descriptor.id} (${descriptor.label}) url=${currentUrl}`);
            const runStart = Date.now();
            try {
                const result = await mod.run(ctx);

                await recordFillLog({
                    applicationId: payload.applicationId,
                    pageName: descriptor.id,
                    fieldsFilled: result.fieldsFilled,
                    fieldsTotal: result.fieldsTotal,
                    fieldsUnmatched: [],
                    validationErrors: result.validationErrors,
                    navigated: result.navigated,
                    attempts: result.attempts,
                    durationMs: result.durationMs,
                    workerId: payload.workerId,
                });

                if (result.applicationIdCaptured) {
                    payload.applicationId = result.applicationIdCaptured;
                    const dod = evaluateDefinitionOfDone(result.applicationIdCaptured);
                    logInfo(
                        `DoD — applicationId=${result.applicationIdCaptured} done=${dod.done} alert=${dod.alertReason ?? '—'}`,
                    );
                }

                if (result.navigated) {
                    await captureForDiagnostics(page, `${descriptor.id}-success`).catch(() => undefined);
                }

                log.info(`DS160 step ${step} ← leaving ${descriptor.id} in ${Date.now() - runStart}ms (url=${page.url()})`);

                if (!result.navigated) return; // dry_run or terminal page — stop here
                if (payload.dryRun) return;
            } catch (err) {
                const artifact = await captureForDiagnostics(page, descriptor.id).catch(() => undefined);
                const errorCtx = await collectPageErrorContext(page).catch(() => undefined);
                const summary = errorCtx ? summarizePageError(errorCtx) : undefined;
                if (summary) log.warning(`DS160 step ${step} error context: ${summary}`);
                await recordErrorLog(err, {
                    pageName: descriptor.id,
                    applicationId: payload.applicationId,
                    applicantName: `${payload.applicant.personal1?.surname ?? ''}, ${payload.applicant.personal1?.givenName ?? ''}`.trim(),
                    workerId: payload.workerId,
                    screenshotKey: artifact?.screenshotKey,
                    htmlKey: artifact?.htmlKey,
                    artifactUrl: artifact?.url,
                    stepCounter: step,
                    summary,
                    validators: errorCtx?.visibleValidators,
                    lblErrors: errorCtx?.lblErrors,
                    validationSummary: errorCtx?.validationSummary,
                });
                log.info(`DS160 step ${step} ← leaving ${descriptor.id} with error in ${Date.now() - runStart}ms`);
                const cause = err instanceof EngineError ? err.cause : classifyError(err);
                if (!cause.autoRetry) {
                    throw new NonRetryableError(
                        `[${cause.id}] ${err instanceof Error ? err.message : String(err)}`,
                    );
                }
                throw err;
            }
        }

        throw new EngineError(`Exceeded MAX_PAGE_STEPS (${MAX_PAGE_STEPS})`, {
            cause: 'page_stuck',
        });
    });

    return router;
}
