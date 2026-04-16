// Security Question setup + first applicationId capture.
// Sequence: check Privacy Act (postback) → select question by index → fill answer →
// capture AA... app ID → click Continue → (possibly a confirm page) → capture again + Continue.

import type { Page } from 'playwright';
import { Actor } from 'apify';
import { SECURITY_QUESTION_SELECTORS as SEL, APP_ID_REGEX } from './selectors.js';
import { actAndWaitForPostback } from '../../engine/postback.js';
import { hideTooltipOverlay } from '../../engine/tooltip.js';
import { waitUntil } from '../../engine/waiters.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo, logWarning } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runSecurityQuestionPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page, data } = ctx;

    await hideTooltipOverlay(page);

    // Capture application ID early (may already be visible on entry).
    const earlyAppId = await extractApplicationId(page);
    if (earlyAppId) {
        logInfo(`03_security_question — captured applicationId=${earlyAppId} (pre-submit)`);
        await persistApplicationId(earlyAppId, ctx);
        ctx.applicationId = earlyAppId;
    }

    await checkPrivacyAct(page);
    await setupSecurityQuestion(page, data);

    const urlBefore = page.url();
    logInfo(`03_security_question → clicking Continue (url=${urlBefore})`);
    await clickContinue(page);
    const urlAfter = page.url();
    logInfo(`03_security_question ← after Continue (url=${urlAfter})`);

    // The CEAC flow can bounce through a "Confirm Application ID" page before the actual form.
    // If we are still on the security-question URL, check for validation errors.
    if (urlAfter.includes('SecureQuestion') && urlAfter === urlBefore) {
        const summary = await page.locator(SEL.validationSummary).innerText().catch(() => '');
        throw new EngineError(`Security question submit failed: ${summary || 'url did not advance'}`, {
            cause: summary ? 'validation_error' : 'page_stuck',
            pageName: '03_security_question',
        });
    }

    // On confirm-page, capture app ID and continue.
    const confirmAppId = await extractApplicationId(page);
    if (confirmAppId) {
        logInfo(`03_security_question — confirmed applicationId=${confirmAppId}`);
        await persistApplicationId(confirmAppId, ctx);
        ctx.applicationId = confirmAppId;
    }

    await clickConfirmContinueIfPresent(page);

    const finalAppId = ctx.applicationId ?? confirmAppId ?? earlyAppId;
    if (!finalAppId) {
        logWarning('03_security_question — applicationId was not captured on any page');
    }

    return {
        navigated: true,
        applicationIdCaptured: finalAppId,
        validationErrors: [],
        fieldsFilled: 3,
        fieldsTotal: 3,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

async function checkPrivacyAct(page: Page): Promise<void> {
    const checkbox = await page.$(SEL.privacyCheckbox);
    if (!checkbox) {
        throw new EngineError('Privacy Act checkbox not found', {
            cause: 'dom_mismatch',
            pageName: '03_security_question',
        });
    }
    const alreadyChecked = await checkbox.isChecked();
    if (alreadyChecked) return;
    await actAndWaitForPostback(page, async () => {
        await checkbox.check({ force: true });
    });
}

async function setupSecurityQuestion(page: Page, data: PageContext['data']): Promise<void> {
    const answer = data.recovery?.securityAnswer;
    const questionIndex = inferQuestionIndex(data);

    const select = await page.$(SEL.questionSelect);
    if (select) {
        const disabled = await select.getAttribute('disabled');
        if (disabled === null) {
            // Wait for options to populate (server populates them after the Privacy Act postback).
            await waitUntil(
                page,
                async () =>
                    (await select.evaluate((el) => (el as HTMLSelectElement).options.length)) > 1,
                { timeoutMs: 10_000 },
            );
            await select.selectOption({ index: questionIndex });
        } else {
            logWarning('03_security_question — ddlQuestions disabled; leaving existing question');
        }
    }

    if (answer) {
        const input = await page.$(SEL.answerInput);
        if (input) {
            await input.fill(answer);
            await input.dispatchEvent('blur').catch(() => {});
        } else {
            throw new EngineError('Security answer input not found', {
                cause: 'dom_mismatch',
                pageName: '03_security_question',
                fieldId: 'txtAnswer',
            });
        }
    } else {
        throw new EngineError('Missing recovery.securityAnswer in payload', {
            cause: 'missing_data',
            pageName: '03_security_question',
            fieldId: 'txtAnswer',
        });
    }
}

// Pick a deterministic question index from the payload if it provided one,
// otherwise default to 1 (first question). NEVER invent content.
function inferQuestionIndex(data: PageContext['data']): number {
    const raw = (data.recovery as { securityQuestionIndex?: number | string } | undefined)
        ?.securityQuestionIndex;
    if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 1 && raw <= 20) return raw;
    if (typeof raw === 'string') {
        const n = Number.parseInt(raw, 10);
        if (Number.isFinite(n) && n >= 1 && n <= 20) return n;
    }
    return 1;
}

async function clickContinue(page: Page): Promise<void> {
    await hideTooltipOverlay(page);
    for (const sel of SEL.continueButton) {
        const el = await page.$(sel);
        if (!el) continue;
        await page.click(sel);
        await page.waitForLoadState('domcontentloaded', { timeout: 45_000 }).catch(() => {});
        return;
    }
    throw new EngineError('No enabled Continue button on security question page', {
        cause: 'dom_mismatch',
        pageName: '03_security_question',
    });
}

async function clickConfirmContinueIfPresent(page: Page): Promise<void> {
    const el = await page.$(SEL.confirmContinueButton);
    if (!el) return;
    const disabled = await el.getAttribute('disabled');
    if (disabled !== null) return;
    const urlBefore = page.url();
    await hideTooltipOverlay(page);
    await el.click({ force: true });
    await page.waitForLoadState('domcontentloaded', { timeout: 45_000 }).catch(() => {});
    const urlAfter = page.url();
    logInfo(`03_security_question confirm → url=${urlBefore} → ${urlAfter}`);
}

async function extractApplicationId(page: Page): Promise<string | undefined> {
    // Preferred: dedicated label element
    for (const sel of SEL.appIdLabel) {
        const el = await page.$(sel);
        if (!el) continue;
        const text = (await el.textContent())?.trim() ?? '';
        const match = text.match(APP_ID_REGEX);
        if (match) return match[0];
    }
    // Fallback: any <b> with AA... pattern
    const bolds = await page.$$(SEL.appIdFallbackBold);
    for (const b of bolds) {
        const text = (await b.textContent())?.trim() ?? '';
        const match = text.match(APP_ID_REGEX);
        if (match) return match[0];
    }
    return undefined;
}

async function persistApplicationId(appId: string, ctx: PageContext): Promise<void> {
    const tail = (ctx.data as { _meta?: { taskId?: string } })._meta?.taskId ?? appId;
    const safe = tail.replace(/[^a-zA-Z0-9!_.'()-]/g, '_').slice(0, 240);
    await Actor.setValue(`application-id-${safe}`, {
        applicationId: appId,
        capturedAt: new Date().toISOString(),
    });
}
