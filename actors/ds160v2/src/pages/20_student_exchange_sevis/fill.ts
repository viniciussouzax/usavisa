import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runStudentSevisPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.studentSevis;
    if (!data) {
        throw new EngineError('Missing studentSevis data in payload (required for F/J/M visa)', {
            cause: 'missing_data',
            pageName: '20_student_exchange_sevis',
        });
    }

    return standardPageRun(ctx, {
        pageId: '20_student_exchange_sevis',
        expectedUrlAfter: [/student_add_contact|studentaddcontact|photo|upload|review/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();
            b.addText('tbxSEVIS_ID', data.sevisId);
            b.addText('tbxProgramNumber', data.programNumber);
            b.addText('tbxSchoolName', data.schoolName, { critical: true });
            b.addText('tbxSchoolAddr1', data.schoolStreet1, { critical: true });
            b.addText('tbxSchoolAddr2', data.schoolStreet2);
            b.addText('tbxSchoolCity', data.schoolCity, { critical: true });
            b.addText('tbxSchoolState', data.schoolState);
            b.addText('tbxSchoolPostalCode', data.schoolPostalCode);
            b.addSelectSearch('ddlSchoolCountry', data.schoolCountry);
            b.addText('tbxCourseOfStudy', data.courseOfStudy);
            const { fields, dataLists } = b.build();
            return { pageId: '20_student_exchange_sevis', fields, dataLists };
        },
    });
}
