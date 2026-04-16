// Shared run() implementation for most DS-160 pages. Each page supplies a function
// that builds the FieldSpec[] from the payload; the helper does the rest:
// executePhases → clickNext → URL-before/after check → classify result.

import type { FieldSpec, PageFillSpec } from '../../engine/playwrightPattern.js';
import { executePhases } from '../../engine/playwrightPattern.js';
import { clickNextButton } from '../../engine/navigation.js';
import { readValidationSummary } from '../../engine/validation.js';
import { EngineError } from '../../logging/errors.js';
import { logInfo, logWarning } from '../../logging/logger.js';
import { cssEscape } from '../../schema/normalize.js';
import { isDropdownUnset } from '../../schema/sentinels.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export interface StandardPageConfig {
    pageId: string;
    expectedUrlAfter?: RegExp[];  // if set, after click the URL must match one of these
    buildSpec: (ctx: PageContext) => PageFillSpec | Promise<PageFillSpec>;
}

export async function standardPageRun(
    ctx: PageContext,
    cfg: StandardPageConfig,
): Promise<PageHandlerResult> {
    const start = Date.now();
    const { page } = ctx;

    const spec = await cfg.buildSpec(ctx);
    await executePhases(page, spec);

    // Pre-Next sanity pass (spec engine_rules.md §9.1 — client-side layer).
    // Scan visible <select>s that still hold an "unset" sentinel (""/"SONE"/"-1") and
    // match any field we tried to apply — last-chance to reapply before the server
    // layer sees an empty dropdown.
    await preNextSanityPass(page, spec);

    const urlBefore = page.url();
    logInfo(`${cfg.pageId} → clicking Next (url=${urlBefore}, fields=${spec.fields.length})`);
    await clickNextButton(page);
    const urlAfter = page.url();
    logInfo(`${cfg.pageId} ← after Next (url=${urlAfter})`);

    if (urlAfter === urlBefore) {
        // URL unchanged → error. Classify via validation summary.
        const errors = await readValidationSummary(page);
        if (errors.length > 0) {
            throw new EngineError(
                `${cfg.pageId} submit failed: ${errors.slice(0, 3).map((e) => e.message).join(' | ')}`,
                {
                    cause: 'validation_error',
                    pageName: cfg.pageId,
                    fieldId: errors[0]?.fieldId,
                },
            );
        }
        throw new EngineError(`${cfg.pageId} did not advance — no validation errors visible`, {
            cause: 'page_stuck',
            pageName: cfg.pageId,
        });
    }

    if (cfg.expectedUrlAfter && !cfg.expectedUrlAfter.some((re) => re.test(urlAfter))) {
        // Soft mismatch — URL changed (success) but does not match the expected
        // destination regex. The router will look up the next module by URL anyway;
        // if it is unknown, that guard throws. We just log here.
        logInfo(
            `${cfg.pageId} navigated to unexpected URL ${urlAfter} — continuing (router will classify)`,
        );
    }

    return {
        navigated: true,
        validationErrors: [],
        fieldsFilled: spec.fields.length,
        fieldsTotal: spec.fields.length,
        durationMs: Date.now() - start,
        attempts: 1,
    };
}

// Last-chance pass to catch selects that were silently skipped by the engine
// (hydration timeout, DOM not ready, etc.). Scans the live DOM for visible selects
// that are still empty/SONE/-1 and tries to reapply whatever the field spec asked.
async function preNextSanityPass(
    page: import('playwright').Page,
    spec: PageFillSpec,
): Promise<void> {
    const selectFields = spec.fields.filter(
        (f: FieldSpec) =>
            (f.kind === 'select' || f.kind === 'select-label' || f.kind === 'select-search') &&
            !isDropdownUnset(String(f.value ?? '')),
    );
    if (selectFields.length === 0) return;

    for (const field of selectFields) {
        const sel = `#${cssEscape(field.id)}`;
        const state = await page
            .$eval(sel, (el) => {
                const s = el as HTMLSelectElement;
                const visible = s.offsetParent !== null;
                return { exists: true, value: s.value, visible };
            })
            .catch(() => ({ exists: false, value: '', visible: false }));
        if (!state.exists || !state.visible) continue;
        if (!['', 'SONE', '-1'].includes(state.value)) continue; // already applied

        const value = String(field.value ?? '');
        logWarning(`preNextSanityPass: ${field.id} still unset (current="${state.value}") — last-chance apply value="${value}" kind=${field.kind}`);
        try {
            await page.selectOption(sel, field.kind === 'select-label' ? { label: value } : { value });
        } catch {
            // Fuzzy fallback: try each option text/value substring.
            try {
                const options = await page.$$eval(`${sel} option`, (nodes) =>
                    nodes.map((n) => ({ v: (n as HTMLOptionElement).value, t: (n.textContent ?? '').trim() })),
                );
                const needle = value.toLowerCase();
                const hit =
                    options.find((o) => o.v.toLowerCase() === needle) ??
                    options.find((o) => o.t.toLowerCase() === needle) ??
                    options.find((o) => o.t.toLowerCase().includes(needle));
                if (hit) await page.selectOption(sel, { value: hit.v });
            } catch {
                // swallow — we logged already
            }
        }
    }
}
