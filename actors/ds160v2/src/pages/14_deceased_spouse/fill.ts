import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runDeceasedSpousePage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.deceasedSpouse;
    if (!data) {
        throw new EngineError('Missing deceasedSpouse data in payload (required for W marital status)', {
            cause: 'missing_data',
            pageName: '14_deceased_spouse',
        });
    }

    return standardPageRun(ctx, {
        pageId: '14_deceased_spouse',
        expectedUrlAfter: [/complete_workedu|workEdu1|securityandbackground/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addText('tbxSURNAME', data.surname, { critical: true });
            b.addText('tbxGIVEN_NAME', data.givenName, { critical: true });
            b.addDate('ddlDOBDay', 'ddlDOBMonth', 'tbxDOBYear', data.dob);
            b.addSelectSearch('ddlSpouseNatDropDownList', data.nationality);

            if (isNA(data.cityOfBirth)) {
                b.addCheckbox('cbxSPOUSE_POB_CITY_NA', true);
            } else {
                b.addText('tbxSpousePOBCity', data.cityOfBirth, { critical: true });
            }
            b.addSelectSearch('ddlSpousePOBCountry', data.countryOfBirth);

            const { fields, dataLists } = b.build();
            return { pageId: '14_deceased_spouse', fields, dataLists };
        },
    });
}
