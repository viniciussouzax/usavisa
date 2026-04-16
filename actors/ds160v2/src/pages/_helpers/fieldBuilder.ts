// Field spec builder helpers — all page modules produce FieldSpec[] from the payload.
// These helpers keep each page's fill.ts focused on the page-specific logic, not plumbing.

import type { FieldSpec } from '../../engine/playwrightPattern.js';
import { isNA } from '../../schema/sentinels.js';
import type { CeacDate } from '../../schema/types.js';
import { formatDate, formatTravelDate } from '../../schema/normalize.js';

// ASP.NET prefix — all field IDs on the DS-160 form views share this root.
export const FV_PREFIX = 'ctl00_SiteContentPlaceHolder_FormView1_';

// Build IDs quickly. Accept either a suffix (common case) or a full custom ID.
export function fv(suffix: string): string {
    return suffix.startsWith('ctl00_') ? suffix : `${FV_PREFIX}${suffix}`;
}

export interface BuilderOptions {
    critical?: boolean;
}

export class FieldSpecBuilder {
    private readonly fields: FieldSpec[] = [];
    private readonly dataLists: Array<{ name: string; count: number }> = [];

    addText(id: string, value: unknown, opts: BuilderOptions = {}): this {
        if (!isNA(value)) {
            this.fields.push({ id: fv(id), kind: 'text', value: String(value), critical: opts.critical });
        }
        return this;
    }

    addRadio(id: string, value: unknown): this {
        if (!isNA(value)) this.fields.push({ id: fv(id), kind: 'radio', value });
        return this;
    }

    addSelect(id: string, value: unknown): this {
        if (!isNA(value)) this.fields.push({ id: fv(id), kind: 'select', value });
        return this;
    }

    addSelectLabel(id: string, value: unknown): this {
        if (!isNA(value)) this.fields.push({ id: fv(id), kind: 'select-label', value });
        return this;
    }

    addSelectSearch(id: string, value: unknown): this {
        if (!isNA(value)) this.fields.push({ id: fv(id), kind: 'select-search', value });
        return this;
    }

    addCheckbox(id: string, shouldCheck: boolean): this {
        if (shouldCheck) this.fields.push({ id: fv(id), kind: 'checkbox-check', value: true });
        return this;
    }

    addDate(dayId: string, monthId: string, yearId: string, date: CeacDate | undefined, opts?: { travel?: boolean }): this {
        const formatted = opts?.travel ? formatTravelDate(date) : formatDate(date);
        if (!formatted) return this;
        // CEAC uses numeric <option value> ("01"/"1") but displays "JAN"/"FEB" as label.
        // Sending the abbreviation as value fails (Playwright "did not find some options").
        // Fuzzy select tries exact value → label → partial, so label match finds the right value.
        this.fields.push({ id: fv(dayId), kind: 'select-search', value: formatted.day });
        this.fields.push({ id: fv(monthId), kind: 'select-search', value: formatted.month });
        this.fields.push({ id: fv(yearId), kind: 'text', value: formatted.year });
        return this;
    }

    addDataList(name: string, count: number): this {
        if (count > 0) this.dataLists.push({ name, count });
        return this;
    }

    addFields(fields: FieldSpec[]): this {
        this.fields.push(...fields);
        return this;
    }

    build(): { fields: FieldSpec[]; dataLists: Array<{ name: string; count: number }> } {
        return { fields: [...this.fields], dataLists: [...this.dataLists] };
    }
}

