// Application Dashboard / Confirmation — DoD: extract final applicationId (AA...).
// Then trigger Print Application (must come BEFORE Print Confirmation — spec §2).

import type { Page } from 'playwright';
import { Actor } from 'apify';
import { EngineError } from '../../logging/errors.js';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

const APP_ID_REGEX = /\bAA[0-9A-Z]{8}\b/;

const APP_ID_SELECTORS = [
    'span[id$="_BARCODE_NUMLabel"]',
    'span[id$="_lblAppID"]',
];

const PRINT_APPLICATION_BUTTON = 'input[id$="_btnPrintApp"], a[id$="_btnPrintApp"]';

export async function runApplicationDashboardPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;

    const appId = await extractApplicationId(page);
    if (!appId) {
        throw new EngineError('Could not extract final applicationId from dashboard', {
            cause: 'dom_mismatch',
            pageName: '26_application_dashboard',
        });
    }
    logInfo(`26_application_dashboard — final applicationId=${appId}`);

    await persistApplicationId(appId, ctx);
    ctx.applicationId = appId;

    // Kick off Print Application (leads to page 27).
    const printApp = await page.$(PRINT_APPLICATION_BUTTON);
    if (!printApp) {
        throw new EngineError('Print Application button not found on dashboard', {
            cause: 'dom_mismatch',
            pageName: '26_application_dashboard',
        });
    }
    await printApp.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 45_000 }).catch(() => {});

    return {
        navigated: true,
        applicationIdCaptured: appId,
        validationErrors: [],
        fieldsFilled: 0,
        fieldsTotal: 0,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

async function extractApplicationId(page: Page): Promise<string | undefined> {
    for (const sel of APP_ID_SELECTORS) {
        const el = await page.$(sel);
        if (!el) continue;
        const text = (await el.textContent())?.trim() ?? '';
        const match = text.match(APP_ID_REGEX);
        if (match) return match[0];
    }
    // Fallback — scan body text
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const match = bodyText.match(APP_ID_REGEX);
    return match?.[0];
}

async function persistApplicationId(appId: string, ctx: PageContext): Promise<void> {
    const taskId = (ctx.data as { _meta?: { taskId?: string } })._meta?.taskId ?? appId;
    const safe = taskId.replace(/[^a-zA-Z0-9!_.'()-]/g, '_').slice(0, 240);
    await Actor.setValue(`application-id-final-${safe}`, {
        applicationId: appId,
        capturedAt: new Date().toISOString(),
    });
}
