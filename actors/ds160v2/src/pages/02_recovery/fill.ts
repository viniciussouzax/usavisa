// Recovery page handler. Three sub-states:
//   Phase 2 — surname field visible → fill identity verification (location + surname + DOB year + sec Q/A)
//   Phase 1 with CAPTCHA — image visible → solve CAPTCHA + submit application ID
//   Phase 1 without CAPTCHA — only application ID field → submit without CAPTCHA
// Success is detected by URL leaving Recovery.aspx.

import type { Page } from 'playwright';
import { RECOVERY_SELECTORS, RECOVERY_URL } from './selectors.js';
import { actAndWaitForPostback } from '../../engine/postback.js';
import { solveBotDetectCaptcha } from '../../engine/captcha.js';
import { hideTooltipOverlay } from '../../engine/tooltip.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo, logWarning } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

type RecoverySubState = 'phase2_questions' | 'phase1_captcha' | 'phase1_only' | 'unknown';

export async function runRecoveryPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page, data } = ctx;

    if (!page.url().includes('Recovery.aspx')) {
        await page.goto(RECOVERY_URL, { waitUntil: 'domcontentloaded' });
    }

    const state = await detectSubState(page);
    logInfo(`02_recovery detected sub-state: ${state}`);

    if (state === 'phase2_questions') {
        await fillPhase2Questions(page, data);
    } else if (state === 'phase1_captcha') {
        await fillPhase1Captcha(page, data);
    } else if (state === 'phase1_only') {
        await fillPhase1Only(page, data);
    } else {
        throw new EngineError('Unknown Recovery sub-state', {
            cause: 'unknown_page',
            pageName: '02_recovery',
        });
    }

    if (ctx.dryRun) {
        logInfo('02_recovery dry_run — skipping submit');
        return result(start, false);
    }

    await submitRecovery(page, state);
    await handleExceptionalModals(page);
    await assertSuccess(page);

    return result(start, true);
}

function result(start: number, navigated: boolean): PageHandlerResult {
    return {
        navigated,
        validationErrors: [],
        fieldsFilled: navigated ? 1 : 0,
        fieldsTotal: 1,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

async function detectSubState(page: Page): Promise<RecoverySubState> {
    return page.evaluate((sel) => {
        const surname = document.querySelector<HTMLElement>(sel.surnameInputShort) ?? document.querySelector<HTMLElement>(sel.surnameInput);
        if (surname && surname.offsetParent !== null) return 'phase2_questions';

        const captchaImage = sel.captchaImage
            .map((s) => document.querySelector<HTMLElement>(s))
            .find((el) => el && el.offsetParent !== null);
        const captchaInput = sel.captchaInput
            .map((s) => document.querySelector<HTMLElement>(s))
            .find((el) => el && el.offsetParent !== null);

        const appIdInput = document.querySelector<HTMLElement>(sel.applicationIdInput);
        if (captchaImage && captchaInput) return 'phase1_captcha';
        if (appIdInput && appIdInput.offsetParent !== null) return 'phase1_only';
        return 'unknown';
    }, RECOVERY_SELECTORS) as Promise<RecoverySubState>;
}

async function fillPhase1Only(page: Page, data: PageContext['data']): Promise<void> {
    const appId = data.recovery?.applicationId;
    if (!appId) {
        throw new EngineError('Missing recovery.applicationId for Recovery Phase 1', {
            cause: 'missing_data',
            pageName: '02_recovery',
        });
    }
    await page.fill(RECOVERY_SELECTORS.applicationIdInput, appId);
}

async function fillPhase1Captcha(page: Page, data: PageContext['data']): Promise<void> {
    await fillPhase1Only(page, data);
    const ok = await solveBotDetectCaptcha(page);
    if (!ok) {
        throw new EngineError('Gate B CAPTCHA not solved', {
            cause: 'captcha_failed',
            pageName: '02_recovery',
        });
    }
}

async function fillPhase2Questions(page: Page, data: PageContext['data']): Promise<void> {
    const location = data.location?.location;
    const surname = data.personal1?.surname;
    const dobYear = data.personal1?.dob?.year;
    const answer = data.recovery?.securityAnswer;

    if (!location || !surname || !dobYear || !answer) {
        throw new EngineError('Missing Recovery Phase 2 fields (location/surname/dobYear/securityAnswer)', {
            cause: 'missing_data',
            pageName: '02_recovery',
        });
    }

    const shortSurname = surname.replace(/\s+/g, '').toUpperCase().slice(0, 5);

    await actAndWaitForPostback(page, async () => {
        await page.selectOption(RECOVERY_SELECTORS.locationSelect, { value: location }).catch(() => {});
    });

    if (await page.$(RECOVERY_SELECTORS.surnameInputShort)) {
        await page.fill(RECOVERY_SELECTORS.surnameInputShort, shortSurname);
    } else if (await page.$(RECOVERY_SELECTORS.surnameInput)) {
        await page.fill(RECOVERY_SELECTORS.surnameInput, shortSurname);
    }
    if (await page.$(RECOVERY_SELECTORS.dobYearInput)) {
        await page.fill(RECOVERY_SELECTORS.dobYearInput, dobYear);
    } else if (await page.$(RECOVERY_SELECTORS.yearInputShort)) {
        await page.fill(RECOVERY_SELECTORS.yearInputShort, dobYear);
    }
    if (await page.$(RECOVERY_SELECTORS.answerInput)) {
        await page.fill(RECOVERY_SELECTORS.answerInput, answer);
    }
}

async function submitRecovery(page: Page, state: RecoverySubState): Promise<void> {
    await hideTooltipOverlay(page);
    const candidates = state === 'phase2_questions'
        ? [RECOVERY_SELECTORS.submitPhase2, ...RECOVERY_SELECTORS.submitPhase1]
        : RECOVERY_SELECTORS.submitPhase1;

    for (const sel of candidates) {
        const el = await page.$(sel);
        if (!el) continue;
        await actAndWaitForPostback(page, async () => {
            await el.click({ force: true });
        });
        return;
    }
    throw new EngineError('No Retrieve button found on Recovery page', {
        cause: 'dom_mismatch',
        pageName: '02_recovery',
    });
}

async function handleExceptionalModals(page: Page): Promise<void> {
    const archived = await page.$(RECOVERY_SELECTORS.archivedPanel);
    if (archived && (await archived.isVisible())) {
        logWarning('Recovery: archived application modal — dismissing with No');
        await actAndWaitForPostback(page, async () => {
            await page.click(RECOVERY_SELECTORS.archivedNoBtn).catch(() => {});
        });
    }

    const submitted = await page.$(RECOVERY_SELECTORS.submittedPanel);
    if (submitted && (await submitted.isVisible())) {
        logWarning('Recovery: application already submitted — opening confirmation path');
        await actAndWaitForPostback(page, async () => {
            await page.click(RECOVERY_SELECTORS.submittedViewConfirmRadio).catch(() => {});
        });
        await actAndWaitForPostback(page, async () => {
            await page.click(RECOVERY_SELECTORS.submittedContinueBtn).catch(() => {});
        });
    }
}

async function assertSuccess(page: Page): Promise<void> {
    if (!page.url().includes('Recovery.aspx')) return;

    const summary = await page.locator(RECOVERY_SELECTORS.validationSummary).innerText().catch(() => '');
    const errorLabel = await page.locator(RECOVERY_SELECTORS.errorLabel).innerText().catch(() => '');
    const combined = `${summary}\n${errorLabel}`.trim();

    if (/characters.*do not match|captcha|verification/i.test(combined)) {
        throw new EngineError('Recovery CAPTCHA rejected', {
            cause: 'captcha_failed',
            pageName: '02_recovery',
        });
    }
    if (combined.length > 0) {
        throw new EngineError(`Recovery rejected: ${combined}`, {
            cause: 'validation_error',
            pageName: '02_recovery',
        });
    }
    throw new EngineError('Recovery did not advance — still on Recovery.aspx with no error summary', {
        cause: 'page_stuck',
        pageName: '02_recovery',
    });
}
