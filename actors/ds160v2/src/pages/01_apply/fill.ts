// Landing page handler. Responsibilities:
//   1. Wait until landing_ready (captcha visible)
//   2. Dismiss BrowserReqs / PostMessage modals if shown
//   3. Select location, confirm it survived the postback (BC-1)
//   4. Solve CAPTCHA (Gate A)
//   5. Re-check modal (BC-2), click "Start an Application"
//   6. Validate navigation by URL (BC-3) or classify ValidationSummary (BC-4)

import type { Page } from 'playwright';
import { APPLY_SELECTORS, APPLY_URL } from './selectors.js';
import { detectPageState } from '../../engine/state.js';
import { actAndWaitForPostback } from '../../engine/postback.js';
import { solveBotDetectCaptcha, reloadCaptcha } from '../../engine/captcha.js';
import { hideTooltipOverlay, isModalBlocking } from '../../engine/tooltip.js';
import { waitUntil } from '../../engine/waiters.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

const MAX_LOCATION_RETRIES = 3;

export async function runApplyPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page, data } = ctx;
    const locationCode = data.location?.location;
    if (!locationCode) {
        throw new EngineError('Missing location.location in payload', {
            cause: 'missing_data',
            pageName: '01_apply',
        });
    }

    await ensureLanding(page);
    await dismissPreCaptchaModals(page);
    await selectLocation(page, locationCode);
    await dismissPostSelectionModals(page);

    if (ctx.dryRun) {
        // Dry-run still solves the CAPTCHA to validate the solver path, but stops
        // before clicking Start.
        const ok = await solveBotDetectCaptcha(page);
        if (!ok) {
            throw new EngineError('Gate A CAPTCHA not solved', {
                cause: 'captcha_failed',
                pageName: '01_apply',
            });
        }
        logInfo('01_apply dry_run — skipping Start click');
        return result({ start, navigated: false });
    }

    await attemptStartWithRetries(page);

    return result({ start, navigated: true });
}

function result(opts: { start: number; navigated: boolean }): PageHandlerResult {
    return {
        navigated: opts.navigated,
        validationErrors: [],
        fieldsFilled: 1,
        fieldsTotal: 1,
        durationMs: Date.now() - opts.start,
        attempts: 1,
    };
}

async function ensureLanding(page: Page): Promise<void> {
    if (!page.url().includes('Default.aspx')) {
        await page.goto(APPLY_URL, { waitUntil: 'domcontentloaded' });
    }
    await waitUntil(
        page,
        async () => {
            const state = await detectPageState(page);
            return state === 'landing_ready';
        },
        { timeoutMs: 45_000 },
    );
}

async function dismissPreCaptchaModals(page: Page): Promise<void> {
    await hideTooltipOverlay(page);
    const browserReq = await page.$(APPLY_SELECTORS.browserReqPanel);
    if (browserReq && (await browserReq.isVisible())) {
        await actAndWaitForPostback(page, async () => {
            await page.click(APPLY_SELECTORS.browserReqClose).catch(() => {});
        });
    }
}

async function dismissPostSelectionModals(page: Page): Promise<void> {
    await hideTooltipOverlay(page);
    const post = await page.$(APPLY_SELECTORS.postMessagePanel);
    if (post && (await post.isVisible())) {
        await actAndWaitForPostback(page, async () => {
            await page.click(APPLY_SELECTORS.postMessageClose).catch(() => {});
        });
    }
}

async function selectLocation(page: Page, desired: string): Promise<void> {
    for (let attempt = 1; attempt <= MAX_LOCATION_RETRIES; attempt += 1) {
        await actAndWaitForPostback(page, async () => {
            await page.selectOption(APPLY_SELECTORS.locationSelect, { value: desired });
        });
        const current = await page.inputValue(APPLY_SELECTORS.locationSelect).catch(() => '');
        logInfo(`01_apply location attempt ${attempt}: sent=${desired} current=${current} url=${page.url()}`);
        if (current === desired) return;
        // BC-1: silently reset — retry
    }
    throw new EngineError(`Location ${desired} rejected after ${MAX_LOCATION_RETRIES} attempts`, {
        cause: 'validation_error',
        pageName: '01_apply',
        fieldId: 'ddlLocation',
    });
}

async function clickStart(page: Page): Promise<void> {
    // BC-2: modal may reappear between CAPTCHA and Start
    if (await isModalBlocking(page)) {
        await hideTooltipOverlay(page);
    }
    await page.click(APPLY_SELECTORS.startLink);
    await page.waitForLoadState('domcontentloaded', { timeout: 45_000 }).catch(() => {});
}

const MAX_CAPTCHA_RETRIES = Number(process.env.DS160_CAPTCHA_RETRIES ?? 3);

// Each attempt: solve CAPTCHA → click Start → check URL.
// If URL changes: success.
// If URL stays and ValidationSummary has error text: classify and throw.
// If URL stays and no error text: assume silent CAPTCHA rejection → reload and retry.
async function attemptStartWithRetries(page: Page): Promise<void> {
    for (let attempt = 1; attempt <= MAX_CAPTCHA_RETRIES; attempt += 1) {
        const captchaOk = await solveBotDetectCaptcha(page);
        if (!captchaOk) {
            throw new EngineError('Gate A CAPTCHA not solved', {
                cause: 'captcha_failed',
                pageName: '01_apply',
            });
        }

        await dismissPostSelectionModals(page);

        const urlBefore = page.url();
        logInfo(`01_apply attempt ${attempt}/${MAX_CAPTCHA_RETRIES} → clicking Start (url=${urlBefore})`);
        await clickStart(page);
        const urlAfter = page.url();
        logInfo(`01_apply attempt ${attempt}/${MAX_CAPTCHA_RETRIES} ← after Start (url=${urlAfter})`);

        if (urlAfter !== urlBefore && !urlAfter.includes('Default.aspx')) {
            // URL changed → verify target and return
            await classifyOutcome(page);
            return;
        }

        // URL unchanged — check if server gave us an explicit error
        const summaryText = await page
            .locator(APPLY_SELECTORS.validationSummary)
            .innerText()
            .catch(() => '');

        if (summaryText && summaryText.trim().length > 0) {
            // Explicit error visible. If it's CAPTCHA, retry; else throw.
            const lower = summaryText.toLowerCase();
            const isCaptchaError = /characters.*do not match|captcha|verification/.test(lower);
            if (isCaptchaError && attempt < MAX_CAPTCHA_RETRIES) {
                logInfo(`01_apply attempt ${attempt}: CAPTCHA error — reloading and retrying`);
                await reloadCaptcha(page);
                continue;
            }
            if (/location.*not.*completed/.test(lower)) {
                throw new EngineError('Location not confirmed by server', {
                    cause: 'validation_error',
                    pageName: '01_apply',
                    fieldId: 'ddlLocation',
                });
            }
            throw new EngineError(`Start click failed: ${summaryText}`, {
                cause: isCaptchaError ? 'captcha_failed' : 'validation_error',
                pageName: '01_apply',
            });
        }

        // No explicit error, URL unchanged — silent rejection (usually CAPTCHA wrong).
        if (attempt < MAX_CAPTCHA_RETRIES) {
            logInfo(`01_apply attempt ${attempt}: silent rejection — reloading CAPTCHA`);
            await reloadCaptcha(page);
            continue;
        }

        throw new EngineError('Start click silently rejected — exhausted CAPTCHA retries', {
            cause: 'captcha_failed',
            pageName: '01_apply',
        });
    }
}

async function classifyOutcome(page: Page): Promise<void> {
    const url = page.url();
    if (/SessionTimedOut|TimedOut/i.test(url)) {
        throw new EngineError('Session expired after Start click', {
            cause: 'session_expired',
            pageName: '01_apply',
        });
    }
    if (/SecureQuestion|ConfirmApplicationID|complete_/i.test(url)) return;
    throw new EngineError(`Unexpected URL after Start: ${url}`, {
        cause: 'unknown_page',
        pageName: '01_apply',
    });
}
