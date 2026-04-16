// Two-layer pre-submission verification (engine_rules §9).
// Layer 1 — client-side: scan DOM for empty visible fields (cheap, zero network).
// Layer 2 — server-side: read ASP.NET ValidationSummary after clicking Next (authoritative).

import type { Page } from 'playwright';
import { isSystemButton, isDropdownUnset } from '../schema/sentinels.js';

export interface EmptyFieldReport {
    id: string;
    tag: string;
    type?: string;
}

export async function scanEmptyRequiredFields(page: Page): Promise<EmptyFieldReport[]> {
    return page.evaluate(() => {
        const out: Array<{ id: string; tag: string; type?: string }> = [];
        document
            .querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
                'input, select, textarea',
            )
            .forEach((el) => {
                if (el.offsetParent === null && (el as HTMLInputElement).type !== 'radio' && (el as HTMLInputElement).type !== 'checkbox') return;
                if (!el.id) return;
                const tag = el.tagName.toLowerCase();
                const t = (el as HTMLInputElement).type ?? '';
                if (tag === 'input' && (t === 'hidden' || t === 'submit' || t === 'button')) return;
                if (tag === 'select') {
                    if ((el as HTMLSelectElement).value && !['-1', 'SONE', ''].includes((el as HTMLSelectElement).value)) return;
                    out.push({ id: el.id, tag });
                    return;
                }
                if (tag === 'textarea' || (tag === 'input' && t === 'text')) {
                    if ((el as HTMLInputElement).value && (el as HTMLInputElement).value.trim().length > 0) return;
                    out.push({ id: el.id, tag, type: t });
                }
            });
        return out;
    }).then((items) =>
        items.filter((item) => !isSystemButton(item.id)).filter((item) => {
            if (item.tag === 'select') return !isDropdownUnset(''); // always report
            return true;
        }),
    );
}

export interface ValidationError {
    source: 'summary' | 'validator';
    message: string;
    fieldId?: string;
}

export async function readValidationSummary(page: Page): Promise<ValidationError[]> {
    return page.evaluate(() => {
        const errors: Array<{ source: 'summary' | 'validator'; message: string; fieldId?: string }> = [];

        // Primary: <li> items inside any element whose id contains "ValidationSummary"
        // or class includes validation-summary-errors / alSummary.
        document
            .querySelectorAll<HTMLElement>(
                '.validation-summary-errors li, [id*="alSummary"] li, [id*="ValidationSummary"] li',
            )
            .forEach((li) => {
                const text = (li.textContent ?? '').trim();
                if (text) errors.push({ source: 'summary', message: text });
            });

        // Fallback: if no <li>s found, read the visible summary container text directly.
        if (errors.length === 0) {
            document.querySelectorAll<HTMLElement>('[id*="ValidationSummary"]').forEach((el) => {
                const style = el.style;
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const text = (el.textContent ?? '').trim();
                if (!text) return;
                // Split multi-message summaries on common delimiters.
                const parts = text.split(/(?:\.|\n|  )+/).map((p) => p.trim()).filter(Boolean);
                parts.forEach((p) => {
                    if (p.length > 3 && !/correct all areas/i.test(p)) {
                        errors.push({ source: 'summary', message: p });
                    }
                });
            });
        }

        // Per-field validators (visible ones)
        document
            .querySelectorAll<HTMLElement>(
                '[id*="RequiredFieldValidator"], [id*="RangeValidator"], [id*="fv"], [id*="CustomValidator"]',
            )
            .forEach((el) => {
                const style = el.style;
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const text = (el.textContent ?? '').trim();
                if (!text) return;
                const controlId =
                    el.getAttribute('data-val-controltovalidate') ??
                    el.getAttribute('controltovalidate') ??
                    undefined;
                errors.push({ source: 'validator', message: text, fieldId: controlId ?? undefined });
            });

        return errors;
    });
}
