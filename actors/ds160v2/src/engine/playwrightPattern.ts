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
import { logWarning, logDebug } from '../logging/logger.js';

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

const MAX_PASSES = Number(process.env.DS160_MAX_PASSES ?? 15);
// Short timeout on purpose — if a select has not hydrated in ~2s it is either a phantom
// DataList row or a disabled block; longer waits are pure latency ("waits são vícios").
const SELECT_HYDRATION_TIMEOUT_MS = Number(process.env.DS160_SELECT_HYDRATION_TIMEOUT_MS ?? 2_000);
// Playwright default is 30s — way too long; we want to fail fast and log, not block.
const ACTION_TIMEOUT_MS = Number(process.env.DS160_ACTION_TIMEOUT_MS ?? 3_000);
const ENGINE_VERBOSE = process.env.DS160_ENGINE_VERBOSE === 'true';

const CRITICAL_TEXT_PATTERN = /Address|Street|City|Phone|Payer|Employer|Salary|Income|Occupation/i;
// Any field inside a DataList row needs native interaction (fill + blur) so CEAC
// fires the per-row validators correctly. Batch evaluate setValue misses these.
const DATALIST_ID_PATTERN = /_ctl\d{2}_/;

function isCriticalTextField(field: FieldSpec): boolean {
    if (field.critical) return true;
    if (field.kind !== 'text') return false;
    if (DATALIST_ID_PATTERN.test(field.id)) return true;
    return CRITICAL_TEXT_PATTERN.test(field.id);
}

export async function executePhases(page: Page, spec: PageFillSpec): Promise<void> {
    // Unreachable cache — fields that failed once this run (timeout, not hydrated,
    // option missing). We stop retrying them across passes so each page does not pay
    // 15× ACTION_TIMEOUT_MS on the same impossible field.
    const unreachable = new Set<string>();
    for (let pass = 1; pass <= MAX_PASSES; pass += 1) {
        const { needsRescan } = await runSinglePass(page, spec, unreachable);
        if (ENGINE_VERBOSE) logDebug(`executePhases ${spec.pageId} pass ${pass} needsRescan=${needsRescan} unreachable=${unreachable.size}`);
        if (!needsRescan) return;
    }
    throw new Error(`executePhases: maxPasses (${MAX_PASSES}) exceeded on ${spec.pageId}`);
}

async function runSinglePass(
    page: Page,
    spec: PageFillSpec,
    unreachable: Set<string>,
): Promise<{ needsRescan: boolean }> {
    // Phase 1 — postback-triggering fields (verified against DOM). Process ONE, then rescan.
    for (const field of spec.fields) {
        if (shouldSkipValue(field)) continue;
        if (unreachable.has(field.id)) continue;
        if (!fieldTriggersPostback(field)) continue;
        const reallyPostbacks = await verifyPostbackAgainstDom(page, field);
        if (!reallyPostbacks) continue;

        const applied = await applyField(page, field, { awaitPostback: true });
        if (applied) return { needsRescan: true };
    }

    // Phase 2 — DataList expansion. Also triggers postback per click. Only rescans when
    // rows were actually added this call (added > 0), otherwise we'd loop forever.
    if (spec.dataLists && spec.dataLists.length > 0) {
        let expandedThisPass = false;
        for (const list of spec.dataLists) {
            const { added } = await ensureDataListRows(page, list.name, list.count);
            if (added > 0) expandedThisPass = true;
        }
        if (expandedThisPass) return { needsRescan: true };
    }

    // Phase 3 — reveal-blocks first: radios + checkboxes that don't postback but are
    // intent-markers (e.g. rblPayerAddrSameAsInd=N reveals the payer-address sub-block).
    // Selects nested inside these blocks must come AFTER.
    const simpleRadios: FieldSpec[] = [];
    const checkboxFields: FieldSpec[] = [];
    const staticSelects: FieldSpec[] = [];
    const criticalTextFields: FieldSpec[] = [];
    const batchTextFields: FieldSpec[] = [];

    for (const field of spec.fields) {
        if (shouldSkipValue(field)) continue;
        if (unreachable.has(field.id)) continue;
        const postbacks = await verifyPostbackAgainstDom(page, field);
        if (postbacks) continue;
        if (field.kind === 'radio') simpleRadios.push(field);
        else if (field.kind === 'checkbox-check') checkboxFields.push(field);
        else if (field.kind === 'select' || field.kind === 'select-label' || field.kind === 'select-search') {
            staticSelects.push(field);
        } else if (field.kind === 'text') {
            if (isCriticalTextField(field)) criticalTextFields.push(field);
            else batchTextFields.push(field);
        }
    }

    // 3.a — radios first (they reveal hidden blocks)
    for (const field of simpleRadios) {
        await applyField(page, field, { awaitPostback: false });
    }
    // 3.b — checkboxes (toggle NA/DK)
    for (const field of checkboxFields) {
        await applyField(page, field, { awaitPostback: false });
    }
    // 3.c — static selects. Track failures so we don't retry every pass.
    for (const field of staticSelects) {
        const ok = await applyField(page, field, { awaitPostback: false });
        if (!ok) unreachable.add(field.id);
    }
    // 3.d — text inputs: critical ones one by one (fires blur validators), rest in batch
    for (const field of criticalTextFields) {
        const ok = await applyField(page, field, { awaitPostback: false });
        if (!ok) unreachable.add(field.id);
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

// Trust the catalog by default. Previously we cross-checked against the DOM to avoid
// over-matches like the generic "Country" entry, but that entry is gone — a clean catalog
// is more reliable than DOM inspection, because CEAC strips onchange handlers after a
// postback re-renders the element.
async function verifyPostbackAgainstDom(_page: Page, field: FieldSpec): Promise<boolean> {
    return fieldTriggersPostback(field);
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
    // Idempotent: skip if this radio is already selected (otherwise Phase 1 loops forever
    // on postback-triggering radios because they always match and always "apply").
    const alreadyChecked = await page
        .$eval(selector, (el) => (el as HTMLInputElement).checked)
        .catch(() => false);
    if (alreadyChecked) return false;
    const el = await page.$(selector);
    if (!el) return false;
    await el.click({ force: true, timeout: ACTION_TIMEOUT_MS }).catch(() => {});
    return true;
}

async function applySelect(page: Page, field: FieldSpec, by: 'value' | 'label'): Promise<boolean> {
    const value = String(field.value ?? '');
    if (isDropdownUnset(value)) return false;
    const selector = `#${cssEscape(field.id)}`;
    // Wait for the element present AND hydrated (>1 option). Timeout generous — spec §8.5.
    const ready = await page
        .waitForFunction(
            (sel) => {
                const s = document.querySelector<HTMLSelectElement>(sel);
                return Boolean(s && s.options.length > 1);
            },
            selector,
            { timeout: SELECT_HYDRATION_TIMEOUT_MS },
        )
        .then(() => true)
        .catch(() => false);
    if (!ready) {
        logWarning(`applySelect: ${field.id} never hydrated (>1 option) within ${SELECT_HYDRATION_TIMEOUT_MS}ms — value=${value}`);
        return false;
    }
    const el = await page.$(selector);
    if (!el) {
        logWarning(`applySelect: ${field.id} element missing after hydration — value=${value}`);
        return false;
    }
    // Idempotency (to prevent infinite postback loops): if the dropdown already holds
    // the desired value we return false — caller treats as "no change", no rescan.
    // This check is now SAFE because hydration above guarantees options are loaded.
    const currentBefore = await el.inputValue().catch(() => '');
    if (by === 'value' && currentBefore === value) return false;
    if (by === 'label') {
        const labelNow = await el.evaluate((node) => {
            const s = node as HTMLSelectElement;
            return s.options[s.selectedIndex]?.textContent?.trim() ?? '';
        });
        if (labelNow === value) return false;
    }
    try {
        if (by === 'value') await el.selectOption({ value }, { timeout: ACTION_TIMEOUT_MS });
        else await el.selectOption({ label: value }, { timeout: ACTION_TIMEOUT_MS });
    } catch (err) {
        // Dump first 12 option values to help diagnose "did not find some options".
        const opts = await el
            .evaluate((node) => {
                const s = node as HTMLSelectElement;
                return Array.from(s.options).slice(0, 12).map((o) => `${o.value}→${(o.textContent ?? '').trim().slice(0, 20)}`);
            })
            .catch(() => [] as string[]);
        logWarning(`applySelect: ${field.id} failed value="${value}" by=${by} — options=[${opts.join(' | ')}] err=${err instanceof Error ? err.message.split('\n')[0] : err}`);
        return false;
    }
    // Re-read to confirm it actually took.
    const confirmed = await el.inputValue().catch(() => '');
    if (by === 'value' && confirmed !== value) {
        logWarning(`applySelect: ${field.id} applied "${value}" but dropdown settled on "${confirmed}"`);
        return false;
    }
    return true;
}

// Fuzzy select: exact value → exact label → partial label → partial value.
async function applySelectFuzzy(page: Page, field: FieldSpec): Promise<boolean> {
    const raw = String(field.value ?? '').trim();
    if (isDropdownUnset(raw)) return false;
    const selector = `#${cssEscape(field.id)}`;
    const ready = await page
        .waitForFunction(
            (sel) => {
                const s = document.querySelector<HTMLSelectElement>(sel);
                return Boolean(s && s.options.length > 1);
            },
            selector,
            { timeout: SELECT_HYDRATION_TIMEOUT_MS },
        )
        .then(() => true)
        .catch(() => false);
    if (!ready) {
        logWarning(`applySelectFuzzy: ${field.id} never hydrated within ${SELECT_HYDRATION_TIMEOUT_MS}ms — value="${raw}"`);
        return false;
    }
    const el = await page.$(selector);
    if (!el) {
        logWarning(`applySelectFuzzy: ${field.id} element missing — value="${raw}"`);
        return false;
    }

    const options = await el.evaluate((node) => {
        const opts = (node as HTMLSelectElement).options;
        return Array.from(opts).map((o, i) => ({ value: o.value, text: (o.textContent ?? '').trim(), selected: i === (node as HTMLSelectElement).selectedIndex }));
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

    if (candidates.length === 0) {
        logWarning(`applySelectFuzzy: ${field.id} no option matched "${raw}" (option count=${options.length})`);
        return false;
    }

    // Idempotent: already resolved to one of the candidates → no-op (avoids loops).
    const selected = options.find((o) => o.selected);
    if (selected && candidates.includes(selected.value)) return false;

    for (const value of candidates) {
        try {
            await el.selectOption({ value }, { timeout: ACTION_TIMEOUT_MS });
            const confirmed = await el.inputValue().catch(() => '');
            if (confirmed === value) return true;
        } catch {
            continue;
        }
    }
    logWarning(`applySelectFuzzy: ${field.id} none of candidates [${candidates.join(',')}] stuck for "${raw}"`);
    return false;
}

async function applyCheckboxCheck(page: Page, field: FieldSpec): Promise<boolean> {
    const selector = `#${cssEscape(field.id)}`;
    const alreadyChecked = await page
        .$eval(selector, (el) => (el as HTMLInputElement).checked)
        .catch(() => false);
    if (alreadyChecked) return true;
    await page.click(selector, { force: true, timeout: ACTION_TIMEOUT_MS }).catch(() => {});
    return true;
}

async function applyText(page: Page, field: FieldSpec): Promise<boolean> {
    const value = String(field.value ?? '');
    const selector = `#${cssEscape(field.id)}`;
    const el = await page.$(selector);
    if (!el) return false;
    await el.fill(value, { timeout: ACTION_TIMEOUT_MS }).catch(() => {});
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
