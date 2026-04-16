// Pre-flight normalization for values heading into the CEAC DOM.
// Keep this thin: upstream JSON already arrives ASCII-clean and in CEAC codes.
// The helpers here handle the edge cases we can't assume upstream handled.

import type { CeacDate } from './types.js';

export function stripDiacritics(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function toAscii(input: string): string {
    return stripDiacritics(input).replace(/[^\x00-\x7F]/g, '');
}

const MONTH_CODES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function padDay(day: string | number): string {
    const n = typeof day === 'number' ? day : Number.parseInt(String(day).trim(), 10);
    if (!Number.isFinite(n) || n < 1 || n > 31) return String(day ?? '');
    return String(n).padStart(2, '0');
}

export function monthCode(month: string | number): string {
    if (typeof month === 'string') {
        const upper = month.trim().toUpperCase();
        if (MONTH_CODES.includes(upper)) return upper;
        const numeric = Number.parseInt(upper, 10);
        if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return MONTH_CODES[numeric - 1]!;
        return upper;
    }
    if (typeof month === 'number' && month >= 1 && month <= 12) return MONTH_CODES[month - 1]!;
    return String(month ?? '');
}

// Standard DS-160 date format for most pages: day zero-padded, month as 3-letter code.
export function formatDate(date: CeacDate | undefined): { day: string; month: string; year: string } | undefined {
    if (!date) return undefined;
    return {
        day: padDay(date.day),
        month: monthCode(date.month),
        year: String(date.year ?? '').trim(),
    };
}

// Travel page exception — days and months go as raw integers without zero-padding.
// IDs: ddlARRIVAL_US_DTEDay, ddlARRIVAL_US_DTEMonth, ddlTRAVEL_DTEDay, ddlTRAVEL_DTEMonth,
//      ddlDEPARTURE_US_DTEDay, ddlDEPARTURE_US_DTEMonth
export function formatTravelDate(date: CeacDate | undefined): { day: string; month: string; year: string } | undefined {
    if (!date) return undefined;
    const dayNum = Number.parseInt(String(date.day).trim(), 10);
    const monthNum = MONTH_CODES.indexOf(monthCode(date.month)) + 1;
    return {
        day: Number.isFinite(dayNum) ? String(dayNum) : String(date.day),
        month: monthNum >= 1 ? String(monthNum) : String(date.month),
        year: String(date.year ?? '').trim(),
    };
}

// CSS selector escape for ASP.NET IDs containing `$`.
export function cssEscape(id: string): string {
    return id.replace(/\$/g, '\\$');
}
