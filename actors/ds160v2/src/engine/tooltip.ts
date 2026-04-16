// Neutralizes the ASP.NET ToolTipManager1 overlay that CEAC renders on certain states.
// The bubble_tooltip_content element blocks pointer events on top of other controls —
// hide it before every click (default behavior, not a fallback).

import type { Page } from 'playwright';

export async function hideTooltipOverlay(page: Page): Promise<void> {
    await page.evaluate(() => {
        const overlays = document.querySelectorAll<HTMLElement>(
            '[id*="bubble_tooltip_content"], [id*="ToolTipManager"], .modalBackground',
        );
        overlays.forEach((el) => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
        });
    });
}

// Detects a modal (.modalBackground) that intercepts clicks between actions —
// see 01_apply BC-2 (modal can reappear after CAPTCHA resolution, before Start click).
export async function isModalBlocking(page: Page): Promise<boolean> {
    return page.evaluate(() => {
        const modals = document.querySelectorAll<HTMLElement>('.modalBackground');
        for (const el of modals) {
            const rect = el.getBoundingClientRect();
            const visible = rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
            if (visible) return true;
        }
        return false;
    });
}
