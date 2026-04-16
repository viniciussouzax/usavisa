// Page state detection (guard pattern — engine_rules §7).
// Navigating to a URL does not guarantee the page reached the expected state.
// The engine classifies the current page by URL + DOM markers, in strict priority order.

import type { Page } from 'playwright';

export type PageState =
    | 'landing_ready'
    | 'landing_partial'
    | 'challenge'
    | 'recovery_captcha'
    | 'recovery_questions'
    | 'recovery_app_id_only'
    | 'security_question'
    | 'session_timeout'
    | 'unknown';

export async function detectPageState(page: Page): Promise<PageState> {
    const url = page.url();
    const html = await page.content();

    // Priority 1 — session timeout beats everything (CEAC sometimes redirects here silently)
    if (/SessionTimedOut|TimedOut/i.test(url)) return 'session_timeout';

    // Priority 2 — landing (checked before challenge to avoid false positives from passive TSPD scripts)
    if (/Default\.aspx/i.test(url)) {
        const hasLandingMarkers = await page.evaluate(() => {
            const ddl = document.querySelector('select[id$="_ddlLocation"]');
            const link = document.querySelector('a[id$="_lnkNew"], a[id$="_lnkRetrieve"]');
            return Boolean(ddl && link);
        });
        if (hasLandingMarkers) {
            const captchaVisible = await page.evaluate(() => {
                const img = document.querySelector<HTMLImageElement>(
                    'img[id*="CaptchaImage"], .LBD_CaptchaImage',
                );
                return Boolean(img && img.offsetParent !== null);
            });
            return captchaVisible ? 'landing_ready' : 'landing_partial';
        }
    }

    // Priority 3 — TSPD / Akamai challenge (only if landing did not match)
    const tspdMarkers = /\/TSPD\/|loaderConfig\s*=\s*"\/TSPD\/|src="\/TSPD\//;
    if (tspdMarkers.test(html)) {
        const hasChallengeDom = await page.evaluate(() => {
            return Boolean(document.querySelector('input#ans, button#jar'));
        });
        if (hasChallengeDom) return 'challenge';
    }

    // Priority 4 — recovery (3 sub-states: questions > captcha > app-id-only)
    if (/Retrieve|Recovery|ConfirmApplicationID/i.test(url)) {
        const hasSurname = await page.evaluate(() =>
            Boolean(document.querySelector('input[id$="_txbSurname"]')),
        );
        if (hasSurname) return 'recovery_questions';

        const hasCaptcha = await page.evaluate(() => {
            const img = document.querySelector<HTMLImageElement>('img[id*="CaptchaImage"]');
            const input = document.querySelector('input[id*="txtCodeTextBox"]');
            return Boolean(img && input && img.offsetParent !== null);
        });
        if (hasCaptcha) return 'recovery_captcha';

        const hasAppId = await page.evaluate(() =>
            Boolean(document.querySelector('input[id*="ApplicationID"]')),
        );
        if (hasAppId) return 'recovery_app_id_only';
    }

    // Priority 5 — security question (either URL or DOM marker)
    if (/SecureQuestion/i.test(url)) return 'security_question';
    const hasPrivacyCheckbox = await page.evaluate(() =>
        Boolean(document.querySelector('input[id$="chkbxPrivacyAct"]')),
    );
    if (hasPrivacyCheckbox) return 'security_question';

    return 'unknown';
}

// Irrecoverable states — engine must discard the current browser session.
export const DISCARD_STATES: PageState[] = ['challenge', 'session_timeout'];

export function isSessionIrrecoverable(state: PageState): boolean {
    return DISCARD_STATES.includes(state);
}
