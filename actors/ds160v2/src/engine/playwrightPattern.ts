// The 4-Phase Playwright Pattern. Every page handler hands the engine a `PageFillSpec`
// and the engine runs each phase in order, respecting ASP.NET postback synchronization.
//
// Phase 1 — Resolve Target:  radios/selects that trigger postback are set first.
// Phase 2 — Mutate DOM:      DataLists are expanded (Add Another clicks) and trailing
//                            empty rows are pruned.
// Phase 3 — Network Flush:   static dropdowns (no postback) are set in a batch.
// Phase 4 — Wait Navigation: text inputs — critical ones via native fill (blur fires
//                            ASP.NET validators), the rest via batch evaluate.

import type { Page } from 'playwright';
import { actAndWaitForPostback } from './postback.js';
import { ensureDataListRows, pruneEmptyDataListRows } from './dataLists.js';
import { hideTooltipOverlay } from './tooltip.js';
import { triggersPostback } from '../schema/postbackCatalog.js';
import { isNA, isDropdownUnset } from '../schema/sentinels.js';
import { cssEscape } from '../schema/normalize.js';

export type FieldKind =
    | 'radio'         // <input type="radio"> — derives _0 (Yes) / _1 (No) suffix
    | 'select'        // <select> — by value
    | 'select-label'  // <select> — by option text
    | 'select-search' // <select> — fuzzy fallback chain
    | 'text'          // <input type="text"> / <textarea>
    | 'checkbox-check'; // <input type="checkbox"> — check if not checked

export interface FieldSpec {
    id: string;          // ASP.NET full ID (with `$`)
    kind: FieldKind;
    value: unknown;
    dataList?: { name: string; index: number };
    critical?: boolean;  // text field that must fire blur via native fill
}

export interface PageFillSpec {
    pageId: string;
    fields: FieldSpec[];
    dataLists?: Array<{ name: string; count: number }>;
}

const MAX_PASSES = Number(process.env.DS160_MAX_PASSES ?? 10);

const CRITICAL_TEXT_PATTERN = /Address|Street|City|Phone|Payer|Employer|Salary|Income|Occupation/i;

function isCriticalTextField(field: FieldSpec): boolean {
    if (field.critical) return true;
    if (field.kind !== 'text') return false;
    return CRITICAL_TEXT_PATTERN.test(field.id);
}

export async function executePhases(page: Page, spec: PageFillSpec): Promise<void> {
    for (let pass = 1; pass <= MAX_PASSES; pass += 1) {
        const { needsRescan } = await runSinglePass(page, spec);
        if (!needsRescan) return;
    }
    throw new Error(`executePhases: maxPasses (${MAX_PASSES}) exceeded on ${spec.pageId}`);
}

async function runSinglePass(page: Page, spec: PageFillSpec): Promise<{ needsRescan: boolean }> {
    // Phase 1 — postback-triggering fields. Process ONE, then rescan.
    for (const field of spec.fields) {
        if (shouldSkipValue(field)) continue;
        if (!fieldTriggersPostback(field)) continue;

        const applied = await applyField(page, field, { awaitPostback: true });
        if (applied) return { needsRescan: true };
    }

    // Phase 2 — DataList expansion. Also triggers postback per click.
    if (spec.dataLists && spec.dataLists.length > 0) {
        let expanded = false;
        for (const list of spec.dataLists) {
            const count = await ensureDataListRows(page, list.name, list.count);
            if (count < list.count) {
                // could not expand further — continue anyway
            } else {
                expanded = true;
            }
        }
        if (expanded) return { needsRescan: true };
    }

    // Phase 3 — static dropdowns (no postback).
    for (const field of spec.fields) {
        if (shouldSkipValue(field)) continue;
        if (field.kind !== 'select' && field.kind !== 'select-label' && field.kind !== 'select-search') continue;
        if (fieldTriggersPostback(field)) continue;
        await applyField(page, field, { awaitPostback: false });
    }

    // Phase 4 — text inputs. Critical ones one by one (fill fires blur), rest in batch.
    const criticalTextFields: FieldSpec[] = [];
    const batchTextFields: FieldSpec[] = [];
    const checkboxFields: FieldSpec[] = [];
    const simpleRadios: FieldSpec[] = [];

    for (const field of spec.fields) {
        if (shouldSkipValue(field)) continue;
        if (fieldTriggersPostback(field)) continue;
        if (field.kind === 'radio') simpleRadios.push(field);
        else if (field.kind === 'checkbox-check') checkboxFields.push(field);
        else if (field.kind === 'text') {
            if (isCriticalTextField(field)) criticalTextFields.push(field);
            else batchTextFields.push(field);
        }
    }

    for (const field of simpleRadios) {
        await applyField(page, field, { awaitPostback: false });
    }
    for (const field of checkboxFields) {
        await applyField(page, field, { awaitPostback: false });
    }
    for (const field of criticalTextFields) {
        await applyField(page, field, { awaitPostback: false });
    }
    if (batchTextFields.length > 0) {
        await applyBatchText(page, batchTextFields);
    }

    await pruneEmptyDataListRows(page);

    return { needsRescan: false };
}

function shouldSkipValue(field: FieldSpec): boolean {
    return isNA(field.value);
}

function fieldTriggersPostback(field: FieldSpec): boolean {
    if (field.kind === 'radio') {
        const val = typeof field.value === 'string' ? field.value : undefined;
        return triggersPostback(field.id, val);
    }
    if (field.kind === 'select' || field.kind === 'select-label' || field.kind === 'select-search') {
        return triggersPostback(field.id);
    }
    return false;
}

async function applyField(
    page: Page,
    field: FieldSpec,
    opts: { awaitPostback: boolean },
): Promise<boolean> {
    await hideTooltipOverlay(page);

    const exec = async (): Promise<boolean> => {
        switch (field.kind) {
            case 'radio':
                return applyRadio(page, field);
            case 'select':
                return applySelect(page, field, 'value');
            case 'select-label':
                return applySelect(page, field, 'label');
            case 'select-search':
                return applySelectFuzzy(page, field);
            case 'checkbox-check':
                return applyCheckboxCheck(page, field);
            case 'text':
                return applyText(page, field);
            default:
                return false;
        }
    };

    if (opts.awaitPostback) {
        let ok = false;
        await actAndWaitForPostback(page, async () => {
            ok = await exec();
        });
        return ok;
    }
    return exec();
}

async function applyRadio(page: Page, field: FieldSpec): Promise<boolean> {
    const val = String(field.value ?? '').toUpperCase();
    const suffix = val === 'Y' || val === 'YES' ? '_0' : val === 'N' || val === 'NO' ? '_1' : '';
    if (!suffix) return false;
    const selector = `#${cssEscape(field.id + suffix)}`;
    const el = await page.$(selector);
    if (!el) return false;
    await el.check({ force: true }).catch(async () => {
        await el.click({ force: true });
    });
    return true;
}

async function applySelect(page: Page, field: FieldSpec, by: 'value' | 'label'): Promise<boolean> {
    const value = String(field.value ?? '');
    if (isDropdownUnset(value)) return false;
    const selector = `#${cssEscape(field.id)}`;
    const el = await page.$(selector);
    if (!el) return false;
    try {
        if (by === 'value') await el.selectOption({ value });
        else await el.selectOption({ label: value });
        return true;
    } catch {
        return false;
    }
}

// Fuzzy select: exact value → exact label → partial label → partial value.
async function applySelectFuzzy(page: Page, field: FieldSpec): Promise<boolean> {
    const raw = String(field.value ?? '').trim();
    if (isDropdownUnset(raw)) return false;
    const selector = `#${cssEscape(field.id)}`;
    const el = await page.$(selector);
    if (!el) return false;

    const options = await el.evaluate((node) => {
        const opts = (node as HTMLSelectElement).options;
        return Array.from(opts).map((o) => ({ value: o.value, text: (o.textContent ?? '').trim() }));
    });

    const needle = raw.toLowerCase();
    const candidates: string[] = [];
    const exactValue = options.find((o) => o.value.toLowerCase() === needle);
    if (exactValue) candidates.push(exactValue.value);
    const exactLabel = options.find((o) => o.text.toLowerCase() === needle);
    if (exactLabel) candidates.push(exactLabel.value);
    const partialLabel = options.find((o) => o.text.toLowerCase().includes(needle));
    if (partialLabel) candidates.push(partialLabel.value);
    const partialValue = options.find((o) => o.value.toLowerCase().includes(needle));
    if (partialValue) candidates.push(partialValue.value);

    for (const value of candidates) {
        try {
            await el.selectOption({ value });
            return true;
        } catch {
            continue;
        }
    }
    return false;
}

async function applyCheckboxCheck(page: Page, field: FieldSpec): Promise<boolean> {
    const selector = `#${cssEscape(field.id)}`;
    const el = await page.$(selector);
    if (!el) return false;
    const checked = await el.isChecked();
    if (!checked) await el.check({ force: true });
    return true;
}

async function applyText(page: Page, field: FieldSpec): Promise<boolean> {
    const value = String(field.value ?? '');
    const selector = `#${cssEscape(field.id)}`;
    const el = await page.$(selector);
    if (!el) return false;
    await el.fill(value);
    await el.dispatchEvent('change').catch(() => {});
    await el.dispatchEvent('blur').catch(() => {});
    return true;
}

async function applyBatchText(page: Page, fields: FieldSpec[]): Promise<void> {
    const payload = fields.map((f) => ({ id: f.id, value: String(f.value ?? '') }));
    await page.evaluate((items) => {
        items.forEach(({ id, value }) => {
            const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
            if (!el) return;
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }, payload);
}
