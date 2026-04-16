// Print Application — static print-friendly page. Generate PDF via CDP and persist to KV Store.

import type { Page } from 'playwright';
import { Actor } from 'apify';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPrintApplicationPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;
    const appId = ctx.applicationId ?? 'UNKNOWN';

    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    const pdf = await page
        .pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } })
        .catch(() => undefined);

    if (pdf) {
        await Actor.setValue(`application-pdf-${sanitize(appId)}`, pdf, { contentType: 'application/pdf' });
        logInfo(`27_print_application — saved application-pdf-${appId} (${pdf.length} bytes)`);
    } else {
        logInfo('27_print_application — could not generate PDF (page.pdf failed)');
    }

    // Return to the dashboard — in CEAC this is either page.goBack() or a close of this tab.
    await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {});

    return {
        navigated: true,
        validationErrors: [],
        fieldsFilled: pdf ? 1 : 0,
        fieldsTotal: 1,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

function sanitize(s: string): string {
    return s.replace(/[^a-zA-Z0-9!_.'()-]/g, '_').slice(0, 240);
}
