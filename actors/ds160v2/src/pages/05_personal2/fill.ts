import { PERSONAL2_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPersonal2Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.personal2;
    if (!data) {
        throw new EngineError('Missing personal2 data in payload', {
            cause: 'missing_data',
            pageName: '05_personal2',
        });
    }

    return standardPageRun(ctx, {
        pageId: '05_personal2',
        expectedUrlAfter: [/complete_travel/i, /travel_info/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addSelectSearch(ID.nationality, data.nationality);

            b.addRadio(ID.otherNationalityIndicator, data.otherNationality);
            const others = data.otherNationalities ?? [];
            if (data.otherNationality === 'Y' && others.length > 0) {
                b.addDataList(ID.otherNationalityDataList, others.length);
                others.forEach((n, i) => {
                    b.addSelectSearch(ID.otherNationalityCountry(i), n.country);
                    b.addRadio(ID.otherNationalityHasPpt(i), n.hasPassport);
                    if (n.hasPassport === 'Y' && n.passportNumber) {
                        b.addText(ID.otherNationalityPptNum(i), n.passportNumber);
                    }
                });
            }

            b.addRadio(ID.permResOtherCountryIndicator, data.permanentResident);
            const perm = data.permanentResidentCountries ?? [];
            if (data.permanentResident === 'Y' && perm.length > 0) {
                b.addDataList(ID.permResOtherCountryDataList, perm.length);
                perm.forEach((c, i) => {
                    b.addSelectSearch(ID.permResOtherCountry(i), c.country);
                });
            }

            // National ID — NA checkbox + clear input if sentinel value present.
            if (isNA(data.nationalId)) {
                b.addCheckbox(ID.nationalIdNa, true);
            } else {
                b.addText(ID.nationalId, data.nationalId);
            }

            // SSN — object {p1,p2,p3} or sentinel for NA
            const ssn = data.ssn;
            if (ssn && typeof ssn === 'object' && 'p1' in ssn) {
                b.addText(ID.ssn1, ssn.p1);
                b.addText(ID.ssn2, ssn.p2);
                b.addText(ID.ssn3, ssn.p3);
            } else {
                b.addCheckbox(ID.ssnNa, true);
            }

            if (isNA(data.taxId)) {
                b.addCheckbox(ID.taxIdNa, true);
            } else {
                b.addText(ID.taxId, data.taxId);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '05_personal2', fields, dataLists };
        },
    });
}
