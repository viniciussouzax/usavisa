import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runStudentAddContactPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.studentContact;
    if (!data) {
        throw new EngineError('Missing studentContact data in payload (required for F1/J1/M1 principal)', {
            cause: 'missing_data',
            pageName: '21_student_add_contact',
        });
    }

    return standardPageRun(ctx, {
        pageId: '21_student_add_contact',
        expectedUrlAfter: [/photo|upload|review/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();
            b.addText('tbxContact1Surname', data.contact1Surname, { critical: true });
            b.addText('tbxContact1GivenName', data.contact1GivenName, { critical: true });
            b.addText('tbxContact1Phone', data.contact1Phone, { critical: true });
            b.addText('tbxContact1Email', data.contact1Email);
            b.addText('tbxContact2Surname', data.contact2Surname, { critical: true });
            b.addText('tbxContact2GivenName', data.contact2GivenName, { critical: true });
            b.addText('tbxContact2Phone', data.contact2Phone, { critical: true });
            b.addText('tbxContact2Email', data.contact2Email);
            const { fields, dataLists } = b.build();
            return { pageId: '21_student_add_contact', fields, dataLists };
        },
    });
}
