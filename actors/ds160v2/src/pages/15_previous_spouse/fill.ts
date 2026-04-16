import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPreviousSpousePage(ctx: PageContext): Promise<PageHandlerResult> {
    const list = ctx.data.previousSpouses;
    if (!list || list.length === 0) {
        throw new EngineError('Missing previousSpouses in payload (required for D marital status)', {
            cause: 'missing_data',
            pageName: '15_previous_spouse',
        });
    }

    return standardPageRun(ctx, {
        pageId: '15_previous_spouse',
        expectedUrlAfter: [/complete_workedu|workEdu1|securityandbackground/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addText('tbxNumberOfPrevSpouses', String(list.length));
            b.addDataList('DListSpouse', list.length);

            list.forEach((s, i) => {
                const idx = String(i).padStart(2, '0');
                const anyS = s as Record<string, unknown>;
                b.addText(`DListSpouse_ctl${idx}_tbxSURNAME`, s.surname, { critical: true });
                b.addText(`DListSpouse_ctl${idx}_tbxGIVEN_NAME`, s.givenName, { critical: true });
                b.addDate(
                    `DListSpouse_ctl${idx}_ddlDOBDay`,
                    `DListSpouse_ctl${idx}_ddlDOBMonth`,
                    `DListSpouse_ctl${idx}_tbxDOBYear`,
                    s.dob,
                );
                b.addSelectSearch(`DListSpouse_ctl${idx}_ddlSpouseNatDropDownList`, s.nationality);

                if (isNA(anyS['cityOfBirth'])) {
                    b.addCheckbox(`DListSpouse_ctl${idx}_cbxSPOUSE_POB_CITY_NA`, true);
                } else {
                    b.addText(`DListSpouse_ctl${idx}_tbxSpousePOBCity`, anyS['cityOfBirth']);
                }
                b.addSelectSearch(`DListSpouse_ctl${idx}_ddlSpousePOBCountry`, anyS['countryOfBirth']);
                b.addDate(
                    `DListSpouse_ctl${idx}_ddlDomDay`,
                    `DListSpouse_ctl${idx}_ddlDomMonth`,
                    `DListSpouse_ctl${idx}_txtDomYear`,
                    anyS['marriageDate'] as never,
                );
                b.addDate(
                    `DListSpouse_ctl${idx}_ddlDomEndDay`,
                    `DListSpouse_ctl${idx}_ddlDomEndMonth`,
                    `DListSpouse_ctl${idx}_txtDomEndYear`,
                    anyS['marriageEndDate'] as never,
                );
                b.addText(`DListSpouse_ctl${idx}_tbxHowMarriageEnded`, anyS['howEnded']);
                b.addSelectSearch(
                    `DListSpouse_ctl${idx}_ddlMarriageEnded_CNTRY`,
                    anyS['endCountry'],
                );
            });

            const { fields, dataLists } = b.build();
            return { pageId: '15_previous_spouse', fields, dataLists };
        },
    });
}
