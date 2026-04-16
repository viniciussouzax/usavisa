import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

const UNEMPLOYED = new Set(['RT', 'H', 'N']);

export async function runWorkEducation1Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.workEducation1;
    if (!data) {
        throw new EngineError('Missing workEducation1 data in payload', {
            cause: 'missing_data',
            pageName: '16_work_education1',
        });
    }

    return standardPageRun(ctx, {
        pageId: '16_work_education1',
        expectedUrlAfter: [/complete_workeducation2|workEdu2/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addSelect('ddlPresentOccupation', data.occupation);
            if (data.occupation === 'O') {
                // Real CEAC ID is tbxExplainOtherPresentOccupation (confirmed in HTML).
                b.addText('tbxExplainOtherPresentOccupation', data.otherOccupation, { critical: true });
            }

            const showEmployed = !UNEMPLOYED.has(data.occupation);
            if (showEmployed) {
                b.addText('tbxEmpSchName', data.employerName, { critical: true });
                b.addText('tbxEmpSchAddr1', data.employerStreet1, { critical: true });
                b.addText('tbxEmpSchAddr2', data.employerStreet2);
                b.addText('tbxEmpSchCity', data.employerCity, { critical: true });

                if (isNA(data.employerState)) {
                    b.addCheckbox('cbxWORK_EDUC_ADDR_STATE_NA', true);
                } else {
                    b.addText('tbxWORK_EDUC_ADDR_STATE', data.employerState);
                }
                if (isNA(data.employerPostalCode)) {
                    b.addCheckbox('cbxWORK_EDUC_ADDR_POSTAL_CD_NA', true);
                } else {
                    b.addText('tbxWORK_EDUC_ADDR_POSTAL_CD', data.employerPostalCode);
                }

                b.addText('tbxWORK_EDUC_TEL', data.employerPhone, { critical: true });
                b.addSelectSearch('ddlEmpSchCountry', data.employerCountry);
                b.addDate('ddlEmpDateFromDay', 'ddlEmpDateFromMonth', 'tbxEmpDateFromYear', data.employerStartDate);

                if (isNA(data.monthlySalary)) {
                    b.addCheckbox('cbxCURR_MONTHLY_SALARY_NA', true);
                } else {
                    b.addText('tbxCURR_MONTHLY_SALARY', data.monthlySalary, { critical: true });
                }

                b.addText('tbxDescribeDuties', data.duties);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '16_work_education1', fields, dataLists };
        },
    });
}
