// Rich error context collector — called right before recording an error_log.
// Gathers everything a human debugging a failed run wants to see on one line:
// URL, visible validators, ValidationSummary items, any lblError labels.

import type { Page } from 'playwright';

export interface PageErrorContext {
    url: string;
    validationSummary: string[];
    visibleValidators: Array<{ id: string; message: string; fieldId?: string }>;
    lblErrors: string[];
    title?: string;
}

export async function collectPageErrorContext(page: Page): Promise<PageErrorContext> {
    const url = page.url();
    const title = await page.title().catch(() => undefined);

    const validationSummary = await page
        .evaluate(() => {
            const items: string[] = [];
            document
                .querySelectorAll<HTMLElement>('.validation-summary-errors li, [id*="alSummary"] li')
                .forEach((li) => {
                    const txt = (li.textContent ?? '').trim();
                    if (txt) items.push(txt);
                });
            const summaries = document.querySelectorAll<HTMLElement>('[id*="ValidationSummary"]');
            summaries.forEach((s) => {
                const style = s.style;
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const txt = (s.textContent ?? '').trim();
                if (txt) items.push(txt);
            });
            return items;
        })
        .catch(() => [] as string[]);

    const visibleValidators = await page
        .evaluate(() => {
            const out: Array<{ id: string; message: string; fieldId?: string }> = [];
            document
                .querySelectorAll<HTMLElement>(
                    '[id*="RequiredFieldValidator"], [id*="RangeValidator"], [id*="fv"], [id*="CustomValidator"]',
                )
                .forEach((el) => {
                    const style = el.style;
                    if (style.display === 'none' || style.visibility === 'hidden') return;
                    const message = (el.textContent ?? '').trim();
                    if (!message) return;
                    const fieldId =
                        el.getAttribute('data-val-controltovalidate') ??
                        el.getAttribute('controltovalidate') ??
                        undefined;
                    out.push({ id: el.id, message, fieldId: fieldId ?? undefined });
                });
            return out;
        })
        .catch(() => [] as Array<{ id: string; message: string; fieldId?: string }>);

    const lblErrors = await page
        .evaluate(() => {
            const out: string[] = [];
            document.querySelectorAll<HTMLElement>('[id*="lblError"]').forEach((el) => {
                const style = el.style;
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const txt = (el.textContent ?? '').trim();
                if (txt) out.push(txt);
            });
            return out;
        })
        .catch(() => [] as string[]);

    return { url, title, validationSummary, visibleValidators, lblErrors };
}

export function summarizePageError(ctx: PageErrorContext): string {
    const parts: string[] = [];
    if (ctx.validationSummary.length > 0) {
        parts.push(`summary: ${ctx.validationSummary.slice(0, 3).join(' | ').slice(0, 200)}`);
    }
    if (ctx.visibleValidators.length > 0) {
        parts.push(
            `validators(${ctx.visibleValidators.length}): ${ctx.visibleValidators
                .slice(0, 3)
                .map((v) => `${v.fieldId ?? v.id}→${v.message}`)
                .join(' | ')
                .slice(0, 300)}`,
        );
    }
    if (ctx.lblErrors.length > 0) {
        parts.push(`lblError: ${ctx.lblErrors.slice(0, 2).join(' | ').slice(0, 200)}`);
    }
    return parts.join(' || ');
}
