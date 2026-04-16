import { PERSONAL1_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPersonal1Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.personal1;
    if (!data) {
        throw new EngineError('Missing personal1 data in payload', {
            cause: 'missing_data',
            pageName: '04_personal1',
        });
    }

    return standardPageRun(ctx, {
        pageId: '04_personal1',
        expectedUrlAfter: [/personal2/i, /complete_personal/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addText(ID.surname, data.surname, { critical: true });
            b.addText(ID.givenName, data.givenName, { critical: true });

            if (isNA(data.fullNameNative)) {
                b.addCheckbox(ID.fullNameNativeNa, true);
            } else {
                b.addText(ID.fullNameNative, data.fullNameNative);
            }

            b.addRadio(ID.otherNamesIndicator, data.otherNamesUsed);
            const aliases = data.otherNames ?? [];
            if (data.otherNamesUsed === 'Y' && aliases.length > 0) {
                b.addDataList('DListAlias', aliases.length);
                aliases.forEach((name, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addText(`DListAlias_ctl${idx}_tbxSURNAME`, name.surname, { critical: true });
                    b.addText(`DListAlias_ctl${idx}_tbxGIVEN_NAME`, name.givenName, { critical: true });
                });
            }

            b.addRadio(ID.telecodeIndicator, data.telecode);
            if (data.telecode === 'Y') {
                b.addText(ID.telecodeSurname, data.telecodeSurname);
                b.addText(ID.telecodeGivenName, data.telecodeGivenName);
            }

            b.addSelect(ID.sex, data.sex);
            b.addSelect(ID.maritalStatus, data.maritalStatus);
            if (data.maritalStatus === 'O') {
                const otherStatus = (data as { otherMaritalStatus?: string }).otherMaritalStatus;
                b.addText(ID.otherMaritalStatus, otherStatus);
            }

            b.addDate(ID.dobDay, ID.dobMonth, ID.dobYear, data.dob);

            b.addText(ID.pobCity, data.cityOfBirth, { critical: true });
            if (isNA(data.stateOfBirth)) {
                b.addCheckbox(ID.pobStateProvinceNa, true);
            } else {
                b.addText(ID.pobStateProvince, data.stateOfBirth, { critical: true });
            }
            b.addSelectSearch(ID.pobCountry, data.countryOfBirth);

            const { fields, dataLists } = b.build();
            return { pageId: '04_personal1', fields, dataLists };
        },
    });
}
