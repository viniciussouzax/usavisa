// Photo upload. Transport-only: consumes the photo provided in the payload as-is.
// Format/weight adequation (PNG→JPEG, compression <240KB) is the form's responsibility,
// not the automation's. If Identix rejects the photo (too small, no face, wrong format),
// the server error surfaces transparently and the user fixes the source.
// See spec/actors/ceac_ds160/pages/23_photo.md

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page, BrowserContext } from 'playwright';
import { clickNextButton } from '../../engine/navigation.js';
import { hideTooltipOverlay } from '../../engine/tooltip.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

const UPLOAD_BUTTON = 'input[id$="_btnUploadPhoto"]';
const NEXT_BUTTON = 'input[id$="_UpdateButton3"]';

export async function runPhotoPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;
    const photo = ctx.data.photo;

    if (!photo?.path && !photo?.base64 && !photo?.url) {
        throw new EngineError(
            'Photo required at this location (PTA/RCF) but payload has no photo.path, photo.base64 nor photo.url',
            { cause: 'missing_data', pageName: '23_photo' },
        );
    }

    let photoPath: string;
    if (photo.path) {
        photoPath = photo.path;
    } else if (photo.base64) {
        photoPath = await materializeBytes(Buffer.from(photo.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64'), 'base64');
    } else {
        const res = await fetch(photo.url as string);
        if (!res.ok) {
            throw new EngineError(`Photo fetch failed: ${res.status} ${res.statusText}`, {
                cause: 'network',
                pageName: '23_photo',
            });
        }
        const buf = Buffer.from(await res.arrayBuffer());
        photoPath = await materializeBytes(buf, 'url');
    }
    return await uploadPhoto(page, ctx, photoPath, start);
}

async function materializeBytes(buf: Buffer, source: 'base64' | 'url'): Promise<string> {
    const storage = process.env.CRAWLEE_STORAGE_DIR ?? './storage';
    const path = join(storage, `input-photo-${Date.now()}.jpg`);
    await writeFile(path, buf);
    logInfo(`23_photo materialized ${source} payload → ${path} (${buf.byteLength} bytes)`);
    return path;
}

async function uploadPhoto(page: Page, ctx: PageContext, photoPath: string, start: number): Promise<PageHandlerResult> {
    await hideTooltipOverlay(page);

    const upload = await page.$(UPLOAD_BUTTON);
    if (!upload) {
        throw new EngineError('Upload Your Photo button not found', {
            cause: 'dom_mismatch',
            pageName: '23_photo',
        });
    }

    // CEAC may open Identix in a new tab OR navigate the current tab — race both.
    const context = page.context() as BrowserContext;
    const popupPromise = context.waitForEvent('page', { timeout: 30_000 }).catch(() => undefined);
    const mainNavPromise = page
        .waitForURL(/identix\.state\.gov/i, { timeout: 30_000 })
        .then(() => 'main' as const)
        .catch(() => undefined);

    await upload.click({ force: true });

    const [popup, mainNav] = await Promise.all([popupPromise, mainNavPromise]);
    const identixPage: Page | undefined = popup ?? (mainNav ? page : undefined);
    if (!identixPage) {
        throw new EngineError('Identix upload did not open (neither popup nor same-tab navigation detected)', {
            cause: 'timeout',
            pageName: '23_photo',
        });
    }
    const openedInPopup = identixPage !== page;
    logInfo(`23_photo Identix opened ${openedInPopup ? 'in popup' : 'in same tab'} url=${identixPage.url()}`);

    await identixPage.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => {});
    const fileInput = await identixPage.$('input[type="file"]');
    if (!fileInput) {
        throw new EngineError('File input not found in Identix page', {
            cause: 'dom_mismatch',
            pageName: '23_photo',
        });
    }
    await fileInput.setInputFiles(photoPath);
    logInfo(`23_photo uploading ${photoPath}`);

    const submit = await identixPage.$('input[type="image"][id*="btnUpload"], input[type="submit"][value*="Upload"], input[id*="Upload"]');
    if (!submit) {
        throw new EngineError('Upload submit button not found in Identix page', {
            cause: 'dom_mismatch',
            pageName: '23_photo',
        });
    }
    await submit.click();
    await identixPage.waitForLoadState('domcontentloaded', { timeout: 60_000 }).catch(() => {});

    if (openedInPopup) {
        await identixPage.close().catch(() => {});
    } else {
        // Same-tab flow — Identix redirects back to CEAC after upload. Wait for the return.
        await page
            .waitForURL(/ceac\.state\.gov/i, { timeout: 60_000 })
            .catch(() => {});
    }

    // Back on the CEAC page — wait for UpdateButton3 to become enabled.
    await page.waitForFunction(
        (sel) => {
            const el = document.querySelector(sel) as HTMLInputElement | null;
            return Boolean(el && !el.disabled);
        },
        NEXT_BUTTON,
        { timeout: 30_000 },
    );
    await clickNextButton(page);

    // Suppress unused warning
    void ctx;

    return {
        navigated: true,
        validationErrors: [],
        fieldsFilled: 1,
        fieldsTotal: 1,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

