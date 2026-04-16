// DataList (AddAnother) expansion. CEAC uses 4 distinct manifestations for the "Add Another"
// button depending on the section — see engine_rules §6.2. The engine treats them uniformly.
// After each click, a new row appears with _ctl01_, _ctl02_, ... suffix. Presence of that
// suffix is the canonical confirmation that the server processed the expansion.

import type { Page } from 'playwright';
import { actAndWaitForPostback } from './postback.js';
import { hideTooltipOverlay } from './tooltip.js';

const MAX_EXPANSIONS_PER_LIST = 5;

// Locates an "Add Another" button for a given DataList by name, across all 4 manifestations.
async function resolveAddButton(page: Page, listName: string): Promise<string | undefined> {
    return page.evaluate((name) => {
        const candidates: Element[] = [];
        // 1 — InsertButton with list name in ID
        candidates.push(
            ...Array.from(document.querySelectorAll(`[id*="InsertButton"][id*="${name}"]`)),
        );
        // 2 — link containing exact "Add Another" text
        document.querySelectorAll('a').forEach((a) => {
            if ((a.textContent ?? '').trim() === 'Add Another' && a.id.includes(name)) candidates.push(a);
        });
        // 3 — .addone class link
        candidates.push(...Array.from(document.querySelectorAll(`a.addone[id*="${name}"]`)));
        // 4 — __doPostBack reference on link
        document.querySelectorAll('a').forEach((a) => {
            const href = a.getAttribute('href') ?? '';
            const onclick = a.getAttribute('onclick') ?? '';
            if ((href.includes('__doPostBack') || onclick.includes('__doPostBack')) && a.id.includes(name)) {
                candidates.push(a);
            }
        });
        const first = candidates[0] as HTMLElement | undefined;
        return first?.id;
    }, listName);
}

// Ensures the DataList has at least `desiredCount` rows. Each click on the "Add Another"
// button is awaited through the full postback sync. Returns both the final count and how
// many rows were added *this call* — the second value is crucial so the engine knows
// whether a rescan is actually needed (no-op calls must not trigger rescan → infinite loop).
export interface DataListExpansionResult {
    count: number;
    added: number;
}

export async function ensureDataListRows(
    page: Page,
    listName: string,
    desiredCount: number,
): Promise<DataListExpansionResult> {
    if (desiredCount <= 1) return { count: 1, added: 0 };

    let current = await currentRowCount(page, listName);
    let added = 0;

    while (current < desiredCount && added < MAX_EXPANSIONS_PER_LIST) {
        await hideTooltipOverlay(page);
        const buttonId = await resolveAddButton(page, listName);
        if (!buttonId) break;

        const escaped = buttonId.replace(/\$/g, '\\$');
        await actAndWaitForPostback(page, async () => {
            await page.click(`#${escaped}`);
        });

        const next = await currentRowCount(page, listName);
        if (next <= current) break;
        current = next;
        added += 1;
    }

    return { count: current, added };
}

// Counts how many rows already exist for a DataList by looking at _ctlNN_ suffixes.
async function currentRowCount(page: Page, listName: string): Promise<number> {
    return page.evaluate((name) => {
        const nodes = document.querySelectorAll(`[id*="${name}"][id*="_ctl"]`);
        const indices = new Set<number>();
        nodes.forEach((el) => {
            const m = el.id.match(/_ctl(\d+)_/);
            if (m && m[1]) indices.add(Number.parseInt(m[1], 10));
        });
        return indices.size === 0 ? 1 : indices.size + 1;
    }, listName);
}

// Deletes empty trailing rows that CEAC auto-creates inside a DataList (engine_rules §10.4).
// Walks up the DOM up to 15 levels looking for a "Remove"/"Delete" link tied to the row.
export async function pruneEmptyDataListRows(page: Page): Promise<number> {
    const removedIds = await page.evaluate(() => {
        const targets: string[] = [];
        document.querySelectorAll<HTMLInputElement>('input[type=text]').forEach((input) => {
            if (input.offsetParent === null) return;
            if (input.value && input.value.trim().length > 0) return;
            const id = input.id;
            if (!id || (!id.includes('dtl') && !id.includes('DList'))) return;

            let node: HTMLElement | null = input;
            for (let level = 0; level < 15 && node; level += 1) {
                const removeLink = node.querySelector<HTMLAnchorElement>(
                    'a[id*="DeleteButton"], a[id*="RemoveButton"]',
                );
                if (removeLink && removeLink.id) {
                    targets.push(removeLink.id);
                    return;
                }
                node = node.parentElement;
            }
        });
        return Array.from(new Set(targets));
    });

    for (const id of removedIds) {
        const escaped = id.replace(/\$/g, '\\$');
        await actAndWaitForPostback(page, async () => {
            await page.click(`#${escaped}`).catch(() => {});
        });
    }

    return removedIds.length;
}
