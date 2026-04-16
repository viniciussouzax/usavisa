// Crawlee router for the CEAC DS-160 flow.
// The default handler classifies the current page by URL (via PAGE_ORDER) and delegates
// to the corresponding module. Page modules decide whether to enqueue the next URL.

import { createPlaywrightRouter } from '@crawlee/playwright';
import { PAGE_MODULES } from './pages/index.js';
import { findPageByUrl } from './schema/pageOrder.js';
import type { DS160Applicant } from './schema/types.js';
import { detectPageState, isSessionIrrecoverable } from './engine/state.js';
import { EngineError } from './logging/errors.js';
import { recordFillLog, recordErrorLog, logInfo } from './logging/logger.js';
import type { PageContext } from './pages/types.js';
import { evaluateDefinitionOfDone } from './worker/dod.js';

export interface RouterPayload {
    applicant: DS160Applicant;
    dryRun: boolean;
    applicationId?: string;
    workerId: string;
}

export function buildRouter(payload: RouterPayload) {
    const router = createPlaywrightRouter();

    router.addDefaultHandler(async ({ page, log }) => {
        const state = await detectPageState(page);
        if (isSessionIrrecoverable(state)) {
            throw new EngineError(`Irrecoverable state: ${state}`, {
                cause: state === 'session_timeout' ? 'session_expired' : 'challenge_detected',
            });
        }

        const descriptor = findPageByUrl(page.url());
        if (!descriptor) {
            throw new EngineError(`Unknown page: ${page.url()}`, { cause: 'unknown_page' });
        }

        const mod = PAGE_MODULES[descriptor.id];
        const ctx: PageContext = {
            page,
            data: payload.applicant,
            dryRun: payload.dryRun,
            applicationId: payload.applicationId,
        };

        log.info(`DS160 → entering ${descriptor.id} (${descriptor.label})`);
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
        } catch (err) {
            await recordErrorLog(err, {
                pageName: descriptor.id,
                applicationId: payload.applicationId,
                applicantName: `${payload.applicant.personal1?.surname ?? ''}, ${payload.applicant.personal1?.givenName ?? ''}`.trim(),
                workerId: payload.workerId,
            });
            throw err;
        } finally {
            log.info(`DS160 ← leaving ${descriptor.id} in ${Date.now() - runStart}ms`);
        }
    });

    return router;
}
