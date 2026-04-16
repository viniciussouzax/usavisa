// NA / Unknown sentinels — values that MUST never reach the CEAC DOM as literal strings.
// The normalize step either clicks the corresponding "Does Not Apply" checkbox
// or leaves the field untouched, depending on page context.

export const NA_SENTINELS = new Set(['DNA', 'N/A', 'n/a', '', 'null', 'undefined']);

export function isNA(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value !== 'string') return false;
    return NA_SENTINELS.has(value);
}

// Dropdown sentinels meaning "nothing selected" — engine treats these as empty.
export const DROPDOWN_UNSET = new Set(['SONE', '-1', '']);

export function isDropdownUnset(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value !== 'string') return false;
    return DROPDOWN_UNSET.has(value);
}

// ASP.NET system buttons rendered as input[type=text] — excluded from empty-field scans.
export const SYSTEM_BUTTON_IDS = new Set([
    'HelpButton',
    'btnWarning',
    'btnRecover',
    'btnCancel',
    'btnClient',
    'btnNextPage',
]);

export function isSystemButton(id: string): boolean {
    return [...SYSTEM_BUTTON_IDS].some((name) => id.includes(name));
}
