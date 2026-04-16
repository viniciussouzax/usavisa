// ASP.NET async postback synchronization.
// Canonical source of truth: Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack().
// A postback completes in two phases: (1) server-side response (manager flag drops to false),
// then (2) DOM-side settle (browser finishes re-rendering the returned partial HTML).
// Both phases must be awaited before the next interaction — see engine_rules §8.

import type { Page } from 'playwright';
import { waitUntil, waitForStableCount } from './waiters.js';

const POSTBACK_SERVER_TIMEOUT_MS = Number(process.env.DS160_POSTBACK_SERVER_TIMEOUT_MS ?? 30_000);
const POSTBACK_DOM_TIMEOUT_MS = Number(process.env.DS160_POSTBACK_DOM_TIMEOUT_MS ?? 15_000);

async function isInAsyncPostback(page: Page): Promise<boolean> {
    return page.evaluate(() => {
        const w = window as unknown as {
            Sys?: { WebForms?: { PageRequestManager?: { getInstance: () => { get_isInAsyncPostBack: () => boolean } } } };
        };
        try {
            const mgr = w.Sys?.WebForms?.PageRequestManager?.getInstance();
            return typeof mgr?.get_isInAsyncPostBack === 'function' ? mgr.get_isInAsyncPostBack() : false;
        } catch {
            return false;
        }
    });
}

// Registers an instrumentation flag the first time it is called per page.
// Guarantees we can observe postbacks that start and finish between our polls.
async function installPostbackObserver(page: Page): Promise<void> {
    await page.evaluate(() => {
        const w = window as unknown as {
            __ds160Postback?: { inFlight: boolean; lastEnd: number };
            Sys?: { WebForms?: { PageRequestManager?: { getInstance: () => unknown } } };
        };
        if (w.__ds160Postback) return;
        w.__ds160Postback = { inFlight: false, lastEnd: 0 };
        const mgr = w.Sys?.WebForms?.PageRequestManager?.getInstance() as unknown as {
            add_beginRequest: (fn: () => void) => void;
            add_endRequest: (fn: () => void) => void;
        } | undefined;
        if (!mgr) return;
        mgr.add_beginRequest(() => {
            if (w.__ds160Postback) w.__ds160Postback.inFlight = true;
        });
        mgr.add_endRequest(() => {
            if (w.__ds160Postback) {
                w.__ds160Postback.inFlight = false;
                w.__ds160Postback.lastEnd = Date.now();
            }
        });
    });
}

export async function waitForPostbackComplete(page: Page): Promise<void> {
    await installPostbackObserver(page);

    // Phase 1 — server-side: manager flag drops to false
    await waitUntil(
        page,
        async () => {
            const active = await isInAsyncPostback(page);
            const flag = await page.evaluate(() => {
                const w = window as unknown as { __ds160Postback?: { inFlight: boolean } };
                return w.__ds160Postback?.inFlight ?? false;
            });
            return !active && !flag;
        },
        { timeoutMs: POSTBACK_SERVER_TIMEOUT_MS },
    );

    // Phase 2 — DOM-side: partial re-render settles (visible field count stabilizes)
    await waitForStableCount(page, { timeoutMs: POSTBACK_DOM_TIMEOUT_MS });
}

// Helper for callers that know their interaction triggers a postback.
// Performs the action, then waits for both phases to complete.
export async function actAndWaitForPostback(
    page: Page,
    action: () => Promise<void>,
): Promise<void> {
    await installPostbackObserver(page);
    await action();
    await waitForPostbackComplete(page);
}
