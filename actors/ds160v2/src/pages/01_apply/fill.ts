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
import { solveBotDetectCaptcha } from '../../engine/captcha.js';
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

    const captchaOk = await solveBotDetectCaptcha(page);
    if (!captchaOk) {
        throw new EngineError('Gate A CAPTCHA not solved', {
            cause: 'captcha_failed',
            pageName: '01_apply',
        });
    }

    await dismissPostSelectionModals(page);

    if (ctx.dryRun) {
        logInfo('01_apply dry_run — skipping Start click');
        return result({ start, navigated: false });
    }

    await clickStart(page);
    await classifyOutcome(page);

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

async function classifyOutcome(page: Page): Promise<void> {
    const url = page.url();

    if (/SessionTimedOut|TimedOut/i.test(url)) {
        throw new EngineError('Session expired on landing', {
            cause: 'session_expired',
            pageName: '01_apply',
        });
    }
    if (/SecureQuestion|ConfirmApplicationID|complete_/i.test(url)) return;

    // Still on Default.aspx — classify validation summary
    if (/Default\.aspx/i.test(url)) {
        const summaryText = await page
            .locator(APPLY_SELECTORS.validationSummary)
            .innerText()
            .catch(() => '');
        if (/location.*not.*completed/i.test(summaryText)) {
            throw new EngineError('Location not confirmed by server', {
                cause: 'validation_error',
                pageName: '01_apply',
                fieldId: 'ddlLocation',
            });
        }
        if (/characters.*do not match|captcha|verification/i.test(summaryText)) {
            throw new EngineError('CAPTCHA rejected by server', {
                cause: 'captcha_failed',
                pageName: '01_apply',
            });
        }
        throw new EngineError(`Start click failed: ${summaryText || 'unknown reason'}`, {
            cause: 'validation_error',
            pageName: '01_apply',
        });
    }
}
