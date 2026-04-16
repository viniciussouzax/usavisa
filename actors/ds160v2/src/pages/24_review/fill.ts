// Review — bypass-only page. Click "Next" repeatedly until we leave the Review URL.
// NEVER click any "Edit" anchor — that would invalidate the signature flow.

import type { Page } from 'playwright';
import { clickNextButton } from '../../engine/navigation.js';
import { readValidationSummary } from '../../engine/validation.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

const MAX_ITERATIONS = 12;

export async function runReviewPage(ctx: PageContext): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;

    let iterations = 0;
    while (iterations < MAX_ITERATIONS) {
        iterations += 1;
        const urlBefore = page.url();
        if (!/review/i.test(urlBefore)) {
            break;
        }
        logInfo(`24_review iter ${iterations} → clicking Next (url=${urlBefore})`);
        await clickNextButton(page);
        const urlAfter = page.url();
        logInfo(`24_review iter ${iterations} ← url=${urlAfter}`);

        if (urlAfter === urlBefore) {
            const errors = await readValidationSummary(page);
            if (errors.length > 0) {
                throw new EngineError(
                    `24_review blocked by validation: ${errors.slice(0, 3).map((e) => e.message).join(' | ')}`,
                    {
                        cause: 'validation_error',
                        pageName: '24_review',
                    },
                );
            }
            throw new EngineError('24_review did not advance after Next click', {
                cause: 'page_stuck',
                pageName: '24_review',
            });
        }
    }

    if (/review/i.test(page.url())) {
        throw new EngineError(`24_review exceeded ${MAX_ITERATIONS} iterations still on review`, {
            cause: 'page_stuck',
            pageName: '24_review',
        });
    }

    return {
        navigated: true,
        validationErrors: [],
        fieldsFilled: 0,
        fieldsTotal: 0,
        durationMs: Date.now() - start,
        attempts: iterations,
    };
}
