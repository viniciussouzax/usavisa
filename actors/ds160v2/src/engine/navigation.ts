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

// DS-160 navigation buttons on FormView pages use the canonical IDs:
//   Back  → UpdateButton1
//   Save  → UpdateButton2
//   Next  → UpdateButton3
// Some pages also use generic submit inputs with value="Next" or btnNextPage IDs.
// We try the most specific selectors first, then fall back to value-based.
const NAV_ID_SUFFIX: Record<'Next' | 'Previous' | 'Save', string> = {
    Previous: 'UpdateButton1',
    Save: 'UpdateButton2',
    Next: 'UpdateButton3',
};

async function clickNavigationButton(page: Page, label: 'Next' | 'Previous' | 'Save'): Promise<void> {
    await hideTooltipOverlay(page);
    if (await isModalBlocking(page)) {
        await hideTooltipOverlay(page);
    }

    const idSuffix = NAV_ID_SUFFIX[label];
    const selector = [
        `input[id$="${idSuffix}"]:not([disabled])`,
        `input[type="submit"][value="${label}"]:not([disabled])`,
        `input[type="button"][value="${label}"]:not([disabled])`,
        `input[id$="btnNextPage"]:not([disabled])`,
    ].join(', ');

    await page.waitForSelector(selector, { state: 'visible', timeout: NAV_TIMEOUT_MS });

    await page.click(selector);

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
