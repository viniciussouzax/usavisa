// Print Confirmation — final PDF (includes barcode). Saved as confirmation-pdf-{appId}.
// This is the absolute end of the DS-160 lifecycle.

import type { Page } from 'playwright';
import { Actor } from 'apify';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPrintConfirmationPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;
    const appId = ctx.applicationId ?? 'UNKNOWN';

    // Wait for the barcode image to finish loading — PDF must include it.
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
    await page.waitForFunction(() => {
        const img = document.querySelector<HTMLImageElement>('img#Barcode, img[id*="Barcode"]');
        return !img || img.complete;
    }, { timeout: 30_000 }).catch(() => {});

    const pdf = await page
        .pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } })
        .catch(() => undefined);

    if (pdf) {
        await Actor.setValue(`confirmation-pdf-${sanitize(appId)}`, pdf, { contentType: 'application/pdf' });
        logInfo(`28_print_confirmation — saved confirmation-pdf-${appId} (${pdf.length} bytes) — END OF FLOW`);
    } else {
        logInfo('28_print_confirmation — could not generate PDF (page.pdf failed)');
    }

    // Terminal page — do not attempt further navigation. Router loop will exit because
    // next() call leaves the valid URL range.
    return {
        navigated: false, // stopping the loop here; run is complete
        applicationIdCaptured: appId !== 'UNKNOWN' ? appId : undefined,
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
