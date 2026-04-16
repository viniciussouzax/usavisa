import { US_CONTACT_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import { cssEscape } from '../../schema/normalize.js';
import { logInfo } from '../../logging/logger.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runUSContactPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.usContact;
    if (!data) {
        throw new EngineError('Missing usContact data in payload', {
            cause: 'missing_data',
            pageName: '11_us_contact',
        });
    }

    // Pre-flight: toggle the mutually-exclusive NA checkboxes to the correct state BEFORE
    // the engine applies text fields (disabled inputs never accept .fill()).
    //  Contact Person  → NAME_NA=false (enabled), ORG_NA_IND=true  (disabled org)
    //  Organization    → NAME_NA=true  (disabled name), ORG_NA_IND=false (enabled org)
    const wantsOrg = data.contactType === 'O' || (!!data.organization && !data.surname);
    await ensureCheckbox(ctx, ID.nameNa, wantsOrg);
    await ensureCheckbox(ctx, ID.orgNa, !wantsOrg);

    return standardPageRun(ctx, {
        pageId: '11_us_contact',
        expectedUrlAfter: [/complete_family|family1/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            // NA checkboxes were already set in the pre-flight above. Now fill text.
            if (wantsOrg) {
                b.addText(ID.organization, data.organization, { critical: true });
            } else {
                b.addText(ID.surname, data.surname, { critical: true });
                b.addText(ID.givenName, data.givenName, { critical: true });
            }

            b.addSelect(ID.relationship, data.relationship);
            b.addText(ID.street1, data.usContactStreet1, { critical: true });
            b.addText(ID.street2, data.usContactStreet2);
            b.addText(ID.city, data.usContactCity, { critical: true });
            b.addSelect(ID.state, data.usContactState);
            b.addText(ID.zip, data.usContactZip);
            b.addText(ID.phone, data.usContactPhone, { critical: true });

            if (isNA(data.usContactEmail)) {
                b.addCheckbox(ID.emailNa, true);
            } else {
                b.addText(ID.email, data.usContactEmail);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '11_us_contact', fields, dataLists };
        },
    });
}

// Read + optionally toggle a checkbox so its final state matches `desired`.
// Clicking is the safest way — CEAC uses ASP.NET postback-style checkboxes where a
// change fires __doPostBack; the engine's outer wait handles the settle.
async function ensureCheckbox(ctx: PageContext, idSuffix: string, desired: boolean): Promise<void> {
    const sel = `#${cssEscape(`ctl00_SiteContentPlaceHolder_FormView1_${idSuffix}`)}`;
    const current = await ctx.page
        .$eval(sel, (el) => (el as HTMLInputElement).checked)
        .catch(() => null);
    if (current === null) return; // element not present — nothing to do
    if (current === desired) return;
    logInfo(`11_us_contact ensureCheckbox(${idSuffix}) ${current} → ${desired}`);
    await ctx.page.click(sel, { force: true, timeout: 3_000 }).catch(() => {});
    await ctx.page.waitForLoadState('domcontentloaded', { timeout: 3_000 }).catch(() => {});
}
