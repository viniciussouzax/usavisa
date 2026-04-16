import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runFamily2SpousePage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.spouse;
    if (!data) {
        throw new EngineError('Missing spouse data in payload (required for M/C/P/L marital status)', {
            cause: 'missing_data',
            pageName: '13_family2_spouse',
        });
    }

    return standardPageRun(ctx, {
        pageId: '13_family2_spouse',
        expectedUrlAfter: [/complete_workedu|workEdu1|securityandbackground/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addText('tbxSpouseSurname', data.surname, { critical: true });
            b.addText('tbxSpouseGivenName', data.givenName, { critical: true });
            b.addDate('ddlDOBDay', 'ddlDOBMonth', 'tbxDOBYear', data.dob);
            b.addSelectSearch('ddlSpouseNatDropDownList', data.nationality);

            if (isNA(data.cityOfBirth)) {
                b.addCheckbox('cbexSPOUSE_POB_CITY_NA', true);
            } else {
                b.addText('tbxSpousePOBCity', data.cityOfBirth, { critical: true });
            }
            b.addSelectSearch('ddlSpousePOBCountry', data.countryOfBirth);

            b.addSelect('ddlSpouseAddressType', data.addressType);
            if (data.addressType === 'O') {
                const anyData = data as Record<string, unknown>;
                b.addText('tbxSPOUSE_ADDR_LN1', anyData['street1'], { critical: true });
                b.addText('tbxSPOUSE_ADDR_LN2', anyData['street2']);
                b.addText('tbxSPOUSE_ADDR_CITY', anyData['city'], { critical: true });
                if (isNA(anyData['state'])) {
                    b.addCheckbox('cbexSPOUSE_ADDR_STATE_NA', true);
                } else {
                    b.addText('tbxSPOUSE_ADDR_STATE', anyData['state']);
                }
                if (isNA(anyData['postalCode'])) {
                    b.addCheckbox('cbexSPOUSE_ADDR_POSTAL_CD_NA', true);
                } else {
                    b.addText('tbxSPOUSE_ADDR_POSTAL_CD', anyData['postalCode']);
                }
                b.addSelectSearch('ddlSPOUSE_ADDR_CNTRY', anyData['country']);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '13_family2_spouse', fields, dataLists };
        },
    });
}
