// Sign and Submit page handler.
// Flow: preparer=No (postback) → passport → solve Gate C CAPTCHA → btnSignApp → wait for
// UpdateButton3 enabled by server → click Next: Confirmation.
// IMPORTANT: signAppButton is irreversible. In dry_run mode we stop right before clicking it.

import type { Page } from 'playwright';
import { SIGN_SELECTORS } from './selectors.js';
import { actAndWaitForPostback } from '../../engine/postback.js';
import { solveBotDetectCaptcha } from '../../engine/captcha.js';
import { hideTooltipOverlay } from '../../engine/tooltip.js';
import { waitUntil } from '../../engine/waiters.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo, logWarning } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runSignAndSubmitPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page, data, dryRun } = ctx;

    await answerPreparer(page);
    await fillPassport(page, data);

    const captchaOk = await solveBotDetectCaptcha(page);
    if (!captchaOk) {
        throw new EngineError('Gate C CAPTCHA not solved', {
            cause: 'captcha_failed',
            pageName: '25_sign_and_submit',
        });
    }

    if (dryRun) {
        logWarning('25_sign_and_submit dry_run — stopping BEFORE btnSignApp (irreversible)');
        return result(start, false);
    }

    await clickSignApp(page);
    await assertSignatureAccepted(page);
    await clickNextConfirmation(page);

    return result(start, true);
}

function result(start: number, navigated: boolean): PageHandlerResult {
    return {
        navigated,
        validationErrors: [],
        fieldsFilled: navigated ? 2 : 1,
        fieldsTotal: 2,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

async function answerPreparer(page: Page): Promise<void> {
    // Default to "No" — the applicant did not receive assistance. "Yes" would expand
    // a section we have not spec'd yet; payload can override in future by adding a
    // `signAndSubmit.preparer` flag.
    const noBtn = await page.$(SIGN_SELECTORS.preparerNo);
    if (!noBtn) return;
    await hideTooltipOverlay(page);
    await actAndWaitForPostback(page, async () => {
        await noBtn.check({ force: true }).catch(async () => {
            await noBtn.click({ force: true });
        });
    });
}

async function fillPassport(page: Page, data: PageContext['data']): Promise<void> {
    const passportNumber = data.passport?.number;
    if (!passportNumber) {
        throw new EngineError('Missing passport.number for Sign and Submit', {
            cause: 'missing_data',
            pageName: '25_sign_and_submit',
        });
    }
    const el = await page.$(SIGN_SELECTORS.passportInput);
    if (!el) {
        throw new EngineError('Passport input not found on Sign and Submit', {
            cause: 'dom_mismatch',
            pageName: '25_sign_and_submit',
        });
    }
    await el.fill(passportNumber);
    await el.dispatchEvent('blur').catch(() => {});
}

async function clickSignApp(page: Page): Promise<void> {
    logInfo('25_sign_and_submit → clicking btnSignApp (IRREVERSIBLE)');
    await hideTooltipOverlay(page);
    await actAndWaitForPostback(page, async () => {
        await page.click(SIGN_SELECTORS.signAppButton);
    });
}

async function assertSignatureAccepted(page: Page): Promise<void> {
    const summaryText = await page
        .locator(SIGN_SELECTORS.validationSummary)
        .innerText()
        .catch(() => '');
    if (summaryText && summaryText.trim().length > 0) {
        const lower = summaryText.toLowerCase();
        if (/passport/.test(lower)) {
            throw new EngineError(`Sign rejected — passport issue: ${summaryText}`, {
                cause: 'invalid_field_value',
                pageName: '25_sign_and_submit',
                fieldId: 'PPTNumTbx',
            });
        }
        if (/characters.*do not match|captcha|verification/.test(lower)) {
            throw new EngineError('Sign rejected — CAPTCHA', {
                cause: 'captcha_failed',
                pageName: '25_sign_and_submit',
            });
        }
        throw new EngineError(`Sign rejected: ${summaryText}`, {
            cause: 'validation_error',
            pageName: '25_sign_and_submit',
        });
    }
}

async function clickNextConfirmation(page: Page): Promise<void> {
    // Wait for server to enable UpdateButton3 (never force-remove the disabled attribute)
    await waitUntil(
        page,
        async () => {
            const el = await page.$(SIGN_SELECTORS.nextConfirmation);
            if (!el) return false;
            const disabled = await el.getAttribute('disabled');
            return disabled === null;
        },
        { timeoutMs: 30_000 },
    );
    await page.click(SIGN_SELECTORS.nextConfirmation);
    await page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => {});
}
