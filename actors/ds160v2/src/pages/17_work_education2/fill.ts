import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runWorkEducation2Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.workEducation2;
    if (!data) {
        throw new EngineError('Missing workEducation2 data in payload', {
            cause: 'missing_data',
            pageName: '17_work_education2',
        });
    }

    return standardPageRun(ctx, {
        pageId: '17_work_education2',
        expectedUrlAfter: [/complete_workeducation3|workEdu3/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addRadio('rblPreviouslyEmployed', data.hasPreviousEmployment);
            const prevJobs = data.previousEmployment ?? [];
            if (data.hasPreviousEmployment === 'Y' && prevJobs.length > 0) {
                b.addDataList('dtlPrevEmpl', prevJobs.length);
                prevJobs.forEach((j, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbEmployerName`, j.name, { critical: true });
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbEmployerStreetAddress1`, j.prevEmplStreet1, { critical: true });
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbEmployerStreetAddress2`, j.prevEmplStreet2);
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbEmployerCity`, j.prevEmplCity, { critical: true });
                    if (isNA(j.prevEmplState)) {
                        b.addCheckbox(`dtlPrevEmpl_ctl${idx}_cbxPREV_EMPL_ADDR_STATE_NA`, true);
                    } else {
                        b.addText(`dtlPrevEmpl_ctl${idx}_tbxPREV_EMPL_ADDR_STATE`, j.prevEmplState);
                    }
                    if (isNA(j.prevEmplPostalCode)) {
                        b.addCheckbox(`dtlPrevEmpl_ctl${idx}_cbxPREV_EMPL_ADDR_POSTAL_CD_NA`, true);
                    } else {
                        b.addText(`dtlPrevEmpl_ctl${idx}_tbxPREV_EMPL_ADDR_POSTAL_CD`, j.prevEmplPostalCode);
                    }
                    b.addSelectSearch(`dtlPrevEmpl_ctl${idx}_DropDownList2`, j.prevEmplCountry);
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbEmployerPhone`, j.prevEmplPhone, { critical: true });
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbJobTitle`, j.jobTitle);
                    if (isNA(j.supervisor)) {
                        b.addCheckbox(`dtlPrevEmpl_ctl${idx}_cbxSupervisorSurname_NA`, true);
                    } else {
                        b.addText(`dtlPrevEmpl_ctl${idx}_tbSupervisorSurname`, j.supervisor);
                    }
                    if (isNA(j.supervisorGivenName)) {
                        b.addCheckbox(`dtlPrevEmpl_ctl${idx}_cbxSupervisorGivenName_NA`, true);
                    } else {
                        b.addText(`dtlPrevEmpl_ctl${idx}_tbSupervisorGivenName`, j.supervisorGivenName);
                    }
                    b.addDate(
                        `dtlPrevEmpl_ctl${idx}_ddlEmpDateFromDay`,
                        `dtlPrevEmpl_ctl${idx}_ddlEmpDateFromMonth`,
                        `dtlPrevEmpl_ctl${idx}_tbxEmpDateFromYear`,
                        j.startDate,
                    );
                    b.addDate(
                        `dtlPrevEmpl_ctl${idx}_ddlEmpDateToDay`,
                        `dtlPrevEmpl_ctl${idx}_ddlEmpDateToMonth`,
                        `dtlPrevEmpl_ctl${idx}_tbxEmpDateToYear`,
                        j.endDate,
                    );
                    b.addText(`dtlPrevEmpl_ctl${idx}_tbDescribeDuties`, j.duties);
                });
            }

            b.addRadio('rblOtherEduc', data.hasEducation);
            const edu = data.education ?? [];
            if (data.hasEducation === 'Y' && edu.length > 0) {
                b.addDataList('dtlPrevEduc', edu.length);
                edu.forEach((e, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addText(`dtlPrevEduc_ctl${idx}_tbxSchoolName`, e.name, { critical: true });
                    b.addText(`dtlPrevEduc_ctl${idx}_tbxSchoolAddr1`, e.schoolStreet1, { critical: true });
                    b.addText(`dtlPrevEduc_ctl${idx}_tbxSchoolAddr2`, e.schoolStreet2);
                    b.addText(`dtlPrevEduc_ctl${idx}_tbxSchoolCity`, e.schoolCity, { critical: true });
                    if (isNA(e.schoolState)) {
                        b.addCheckbox(`dtlPrevEduc_ctl${idx}_cbxEDUC_INST_ADDR_STATE_NA`, true);
                    } else {
                        b.addText(`dtlPrevEduc_ctl${idx}_tbxEDUC_INST_ADDR_STATE`, e.schoolState);
                    }
                    if (isNA(e.schoolPostalCode)) {
                        b.addCheckbox(`dtlPrevEduc_ctl${idx}_cbxEDUC_INST_POSTAL_CD_NA`, true);
                    } else {
                        b.addText(`dtlPrevEduc_ctl${idx}_tbxEDUC_INST_POSTAL_CD`, e.schoolPostalCode);
                    }
                    b.addSelectSearch(`dtlPrevEduc_ctl${idx}_ddlSchoolCountry`, e.schoolCountry);
                    b.addText(`dtlPrevEduc_ctl${idx}_tbxSchoolCourseOfStudy`, e.course);
                    b.addDate(
                        `dtlPrevEduc_ctl${idx}_ddlSchoolFromDay`,
                        `dtlPrevEduc_ctl${idx}_ddlSchoolFromMonth`,
                        `dtlPrevEduc_ctl${idx}_tbxSchoolFromYear`,
                        e.startDate,
                    );
                    b.addDate(
                        `dtlPrevEduc_ctl${idx}_ddlSchoolToDay`,
                        `dtlPrevEduc_ctl${idx}_ddlSchoolToMonth`,
                        `dtlPrevEduc_ctl${idx}_tbxSchoolToYear`,
                        e.endDate,
                    );
                });
            }

            const { fields, dataLists } = b.build();
            return { pageId: '17_work_education2', fields, dataLists };
        },
    });
}
