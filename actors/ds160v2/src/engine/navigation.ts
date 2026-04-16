// Navigation helpers — clicking Next/Back/Save and validating the resulting state by URL.
// Always hides tooltip/modal overlays before clicking.

import type { Page } from 'playwright';
import { hideTooltipOverlay, isModalBlocking } from './tooltip.js';
import { waitForPostbackComplete } from './postback.js';

const NAV_TIMEOUT_MS = Number(process.env.DS160_NAV_TIMEOUT_MS ?? 45_000);

export async function clickNextButton(page: Page): Promise<void> {
    await clickNavigationButton(page, 'Next');
}

export async function clickPreviousButton(page: Page): Promise<void> {
    await clickNavigationButton(page, 'Previous');
}

export async function clickSaveButton(page: Page): Promise<void> {
    await clickNavigationButton(page, 'Save');
}

async function clickNavigationButton(page: Page, label: 'Next' | 'Previous' | 'Save'): Promise<void> {
    await hideTooltipOverlay(page);
    if (await isModalBlocking(page)) {
        await hideTooltipOverlay(page);
    }

    const selector = `input[type="submit"][value="${label}"], input[type="button"][value="${label}"], input[id$="btnNextPage"][value="${label}"]`;
    await page.waitForSelector(selector, { state: 'visible', timeout: NAV_TIMEOUT_MS });

    await Promise.race([
        page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }).catch(() => {}),
        page.click(selector),
    ]);

    // After click: either a full nav (URL changed) or a partial postback.
    await Promise.race([
        page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT_MS }).catch(() => {}),
        waitForPostbackComplete(page).catch(() => {}),
    ]);
}

export function urlMatches(page: Page, patterns: RegExp[]): boolean {
    const url = page.url();
    return patterns.some((re) => re.test(url));
}

export async function expectUrlMatch(page: Page, patterns: RegExp[]): Promise<void> {
    const url = page.url();
    if (!patterns.some((re) => re.test(url))) {
        throw new Error(`URL mismatch. Expected one of [${patterns.map((r) => r.source).join(', ')}] but got ${url}`);
    }
}
