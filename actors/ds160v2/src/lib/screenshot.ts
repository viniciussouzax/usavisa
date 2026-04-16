// Screenshot + HTML capture for diagnostics. Stores artifacts in the Apify Key-Value Store
// so they survive the run and are inspectable in the Console.
// Key format: shot-{ISO timestamp}-{pageId}.png / .html

import { Actor } from 'apify';
import type { Page } from 'playwright';

export interface CapturedArtifact {
    screenshotKey?: string;
    htmlKey?: string;
    url?: string;
    capturedAt: string;
}

function sanitize(part: string): string {
    return part.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

export async function captureForDiagnostics(
    page: Page,
    tag: string,
): Promise<CapturedArtifact> {
    const iso = new Date().toISOString().replace(/[:.]/g, '-');
    const safe = sanitize(tag);
    const screenshotKey = `shot-${iso}-${safe}`;
    const htmlKey = `html-${iso}-${safe}`;
    const captured: CapturedArtifact = { capturedAt: new Date().toISOString() };

    try {
        captured.url = page.url();
    } catch {
        // page may already be closed
    }

    try {
        const buf = await page.screenshot({ type: 'png', fullPage: false, timeout: 5_000 });
        await Actor.setValue(screenshotKey, buf, { contentType: 'image/png' });
        captured.screenshotKey = screenshotKey;
    } catch {
        // non-fatal — page might have crashed
    }

    try {
        const html = await page.content();
        await Actor.setValue(htmlKey, html, { contentType: 'text/html; charset=utf-8' });
        captured.htmlKey = htmlKey;
    } catch {
        // non-fatal
    }

    return captured;
}
