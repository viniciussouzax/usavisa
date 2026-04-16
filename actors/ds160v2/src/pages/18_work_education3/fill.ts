import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runWorkEducation3Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.workEducation3;
    if (!data) {
        throw new EngineError('Missing workEducation3 data in payload', {
            cause: 'missing_data',
            pageName: '18_work_education3',
        });
    }

    return standardPageRun(ctx, {
        pageId: '18_work_education3',
        expectedUrlAfter: [/complete_securityandbackground|securityandbackground/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addRadio('rblCLAN_TRIBE_IND', data.clanTribe);
            if (data.clanTribe === 'Y') {
                const anyData = data as Record<string, unknown>;
                b.addText('tbxCLAN_TRIBE_NAME', anyData['clanTribeName']);
            }

            // Languages — always at least 1 required
            const langs = data.languages ?? [];
            if (langs.length > 0) {
                b.addDataList('dtlLANGUAGES', langs.length);
                langs.forEach((l, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addText(`dtlLANGUAGES_ctl${idx}_tbxLANGUAGE_NAME`, l.name, { critical: true });
                });
            }

            b.addRadio('rblCOUNTRIES_VISITED_IND', data.countriesVisited);
            const countries = data.countriesVisitedList ?? [];
            if (data.countriesVisited === 'Y' && countries.length > 0) {
                b.addDataList('dtlCountriesVisited', countries.length);
                countries.forEach((c, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addSelectSearch(`dtlCountriesVisited_ctl${idx}_ddlCOUNTRIES_VISITED`, c.country);
                });
            }

            b.addRadio('rblORGANIZATION_IND', data.organizationMember);
            const orgs = data.organizations ?? [];
            if (data.organizationMember === 'Y' && orgs.length > 0) {
                b.addDataList('dtlORGANIZATIONS', orgs.length);
                orgs.forEach((o, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addText(`dtlORGANIZATIONS_ctl${idx}_tbxORGANIZATION_NAME`, o.name, { critical: true });
                });
            }

            b.addRadio('rblSPECIALIZED_SKILLS_IND', data.specializedSkills);
            if (data.specializedSkills === 'Y') {
                b.addText('tbxSPECIALIZED_SKILLS_EXPL', data.specializedSkillsExplanation);
            }

            b.addRadio('rblMILITARY_SERVICE_IND', data.militaryService);
            const military = data.military ?? [];
            if (data.militaryService === 'Y' && military.length > 0) {
                b.addDataList('dtlMILITARY_SERVICE', military.length);
                military.forEach((m, i) => {
                    const idx = String(i).padStart(2, '0');
                    b.addSelectSearch(`dtlMILITARY_SERVICE_ctl${idx}_ddlMILITARY_SVC_CNTRY`, m.country);
                    b.addText(`dtlMILITARY_SERVICE_ctl${idx}_tbxMILITARY_SVC_BRANCH`, m.branch);
                    b.addText(`dtlMILITARY_SERVICE_ctl${idx}_tbxMILITARY_SVC_RANK`, m.rank);
                    b.addText(`dtlMILITARY_SERVICE_ctl${idx}_tbxMILITARY_SVC_SPECIALTY`, m.specialty);
                    b.addDate(
                        `dtlMILITARY_SERVICE_ctl${idx}_ddlMILITARY_SVC_FROMDay`,
                        `dtlMILITARY_SERVICE_ctl${idx}_ddlMILITARY_SVC_FROMMonth`,
                        `dtlMILITARY_SERVICE_ctl${idx}_tbxMILITARY_SVC_FROMYear`,
                        m.startDate,
                    );
                    b.addDate(
                        `dtlMILITARY_SERVICE_ctl${idx}_ddlMILITARY_SVC_TODay`,
                        `dtlMILITARY_SERVICE_ctl${idx}_ddlMILITARY_SVC_TOMonth`,
                        `dtlMILITARY_SERVICE_ctl${idx}_tbxMILITARY_SVC_TOYear`,
                        m.endDate,
                    );
                });
            }

            b.addRadio('rblINSURGENT_ORG_IND', data.insurgentOrg);
            if (data.insurgentOrg === 'Y') {
                b.addText('tbxINSURGENT_ORG_EXPL', data.insurgentOrgExplanation);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '18_work_education3', fields, dataLists };
        },
    });
}
