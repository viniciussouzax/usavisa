// CAPTCHA bridge. Treats all 3 CEAC gates (landing, recovery, sign & submit) identically:
// detect → capture image → solve via CapMonster → inject → validate → on-failure reload + retry.
// See spec/actors/ceac_ds160/captcha_rules.md

import type { Page } from 'playwright';
import { createCapmonster, type CapmonsterClient } from '../lib/capmonster.js';
import { cssEscape } from '../schema/normalize.js';
import { actAndWaitForPostback } from './postback.js';

const IMAGE_SELECTORS = [
    'img[id$="_CaptchaImage"]',
    'img[src*="captcha"]',
    '.LBD_CaptchaImage',
];
const INPUT_SELECTORS = [
    'input[id$="_txtCodeTextBox"]',
    'input[id$="_CodeTextBox"]',
];
const RELOAD_SELECTORS = [
    'a[id*="ReloadLink"]',
    'a[id*="ReloadIcon"]',
    'img[id*="ReloadIcon"]',
];

const MAX_ATTEMPTS = Number(process.env.DS160_CAPTCHA_MAX_ATTEMPTS ?? 4);

export interface CaptchaContext {
    client?: CapmonsterClient;
}

export async function isCaptchaVisible(page: Page): Promise<boolean> {
    return page.evaluate((selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector<HTMLElement>(sel);
            if (el && el.offsetParent !== null) return true;
        }
        return false;
    }, IMAGE_SELECTORS);
}

export async function solveBotDetectCaptcha(page: Page, ctx: CaptchaContext = {}): Promise<boolean> {
    const client = ctx.client ?? createCapmonster();
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const imageBase64 = await captureCaptchaImage(page);
        if (!imageBase64) return false;

        const text = await client.solveBotDetectImage({ body: imageBase64 });
        const ok = await injectCaptchaAnswer(page, text);
        if (!ok) return false;

        const stillVisible = await isCaptchaVisible(page);
        if (!stillVisible) return true;

        // Still visible — server rejected. Reload and retry.
        await reloadCaptcha(page);
    }
    return false;
}

async function captureCaptchaImage(page: Page): Promise<string | undefined> {
    for (const sel of IMAGE_SELECTORS) {
        const el = await page.$(sel);
        if (!el) continue;
        const buf = await el.screenshot({ type: 'png' }).catch(() => undefined);
        if (!buf) continue;
        return Buffer.from(buf).toString('base64');
    }
    return undefined;
}

async function injectCaptchaAnswer(page: Page, text: string): Promise<boolean> {
    for (const sel of INPUT_SELECTORS) {
        const el = await page.$(sel);
        if (!el) continue;
        await el.fill(text);
        await el.dispatchEvent('change').catch(() => {});
        await el.dispatchEvent('blur').catch(() => {});
        return true;
    }
    return false;
}

async function reloadCaptcha(page: Page): Promise<void> {
    for (const sel of RELOAD_SELECTORS) {
        const el = await page.$(sel);
        if (!el) continue;
        await actAndWaitForPostback(page, async () => {
            await el.click({ force: true });
        });
        return;
    }
}

// TSPD / Akamai challenge — case-sensitive ImageToText.
// Returns the resolved text; caller is responsible for injecting it into the challenge form.
export async function solveTSPDChallenge(page: Page, ctx: CaptchaContext = {}): Promise<string | undefined> {
    const client = ctx.client ?? createCapmonster();
    const imageBase64 = await captureCaptchaImage(page);
    if (!imageBase64) return undefined;
    return client.solveTSPDImage({ body: imageBase64 });
}

export { cssEscape };
