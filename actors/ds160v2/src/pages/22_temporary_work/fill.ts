import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runTemporaryWorkPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.temporaryWork;
    if (!data) {
        throw new EngineError('Missing temporaryWork data in payload (required for O1/O2 visa)', {
            cause: 'missing_data',
            pageName: '22_temporary_work',
        });
    }

    return standardPageRun(ctx, {
        pageId: '22_temporary_work',
        expectedUrlAfter: [/photo|upload|review/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();
            b.addText('tbxPetitionNumber', data.petitionNumber);
            b.addText('tbxEmployerName', data.employerName, { critical: true });
            b.addText('tbxJobTitle', data.jobTitle);
            b.addText('tbxMonthlySalary', data.monthlySalary);
            const { fields, dataLists } = b.build();
            return { pageId: '22_temporary_work', fields, dataLists };
        },
    });
}
