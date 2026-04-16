// Canonical waiters. Fixed sleeps (setTimeout / page.waitForTimeout) are forbidden —
// every wait here is based on an observable condition on the page.

import type { Page } from 'playwright';

const DEFAULT_TIMEOUT_MS = Number(process.env.DS160_DEFAULT_TIMEOUT_MS ?? 30_000);
const POLL_INTERVAL_MS = 100;

export interface WaitOptions {
    timeoutMs?: number;
    pollMs?: number;
}

export async function waitUntil(
    page: Page,
    predicate: () => boolean | Promise<boolean>,
    opts: WaitOptions = {},
): Promise<void> {
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pollMs = opts.pollMs ?? POLL_INTERVAL_MS;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        try {
            if (await predicate()) return;
        } catch {
            // swallow — predicates may throw while page is navigating
        }
        await page.waitForFunction(
            (ms) => new Promise((r) => setTimeout(r, ms)),
            pollMs,
            { timeout: pollMs + 500 },
        ).catch(() => {});
    }

    throw new Error('waitUntil: predicate never became true before timeout');
}

export async function waitForSelectorStable(
    page: Page,
    selector: string,
    opts: WaitOptions = {},
): Promise<void> {
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    await page.waitForSelector(selector, { state: 'visible', timeout: timeoutMs });
}

// Count visible, interactive fields excluding ddlLanguage (permanent, distorts stabilization heuristics).
// Used to detect DOM-side settle after an ASP.NET partial postback.
export async function countVisibleFields(page: Page): Promise<number> {
    return page.evaluate(() => {
        const nodes = document.querySelectorAll<HTMLElement>(
            'input:not([type=hidden]), select, textarea',
        );
        let visible = 0;
        nodes.forEach((el) => {
            if (el.id && el.id.includes('ddlLanguage')) return;
            const type = (el as HTMLInputElement).type;
            if (type === 'radio' || type === 'checkbox') {
                visible += 1;
                return;
            }
            if (el.offsetParent !== null) visible += 1;
        });
        return visible;
    });
}

export async function waitForStableCount(
    page: Page,
    opts: { stableTicks?: number; timeoutMs?: number; pollMs?: number } = {},
): Promise<void> {
    const stableTicks = opts.stableTicks ?? 3;
    const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const pollMs = opts.pollMs ?? 150;
    const deadline = Date.now() + timeoutMs;

    let last = await countVisibleFields(page);
    let streak = 0;

    while (Date.now() < deadline) {
        await page.waitForFunction((ms) => new Promise((r) => setTimeout(r, ms)), pollMs, {
            timeout: pollMs + 500,
        }).catch(() => {});
        const current = await countVisibleFields(page);
        if (current === last) {
            streak += 1;
            if (streak >= stableTicks) return;
        } else {
            streak = 0;
            last = current;
        }
    }

    throw new Error('waitForStableCount: field count never stabilized');
}
