import { FAMILY1_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runFamily1Page(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.family1;
    if (!data) {
        throw new EngineError('Missing family1 data in payload', {
            cause: 'missing_data',
            pageName: '12_family1',
        });
    }

    return standardPageRun(ctx, {
        pageId: '12_family1',
        expectedUrlAfter: [
            /spouse/i, /family2/i, /deceased/i, /prevspouse/i,
            /complete_workedu|workEdu1/i,
            /complete_securityandbackground|securityandbackground/i,
        ],
        buildSpec: () => {
            const b = new FieldSpecBuilder();
            const maritalStatus = ctx.data.personal1?.maritalStatus;

            // Father
            if (isNA(data.fatherSurname)) {
                b.addCheckbox(ID.fatherSurnameUnk, true);
            } else {
                b.addText(ID.fatherSurname, data.fatherSurname, { critical: true });
            }
            if (isNA(data.fatherGivenName)) {
                b.addCheckbox(ID.fatherGivenNameUnk, true);
            } else {
                b.addText(ID.fatherGivenName, data.fatherGivenName, { critical: true });
            }
            if (!data.fatherDob || isNA(data.fatherDob.day)) {
                b.addCheckbox(ID.fatherDobUnk, true);
            } else {
                b.addDate(ID.fatherDobDay, ID.fatherDobMonth, ID.fatherDobYear, data.fatherDob);
            }
            b.addRadio(ID.fatherInUSIndicator, data.fatherInUS);
            if (data.fatherInUS === 'Y' && data.fatherUSStatus) {
                b.addSelect(ID.fatherStatus, data.fatherUSStatus);
            }

            // Mother
            if (isNA(data.motherSurname)) {
                b.addCheckbox(ID.motherSurnameUnk, true);
            } else {
                b.addText(ID.motherSurname, data.motherSurname, { critical: true });
            }
            if (isNA(data.motherGivenName)) {
                b.addCheckbox(ID.motherGivenNameUnk, true);
            } else {
                b.addText(ID.motherGivenName, data.motherGivenName, { critical: true });
            }
            if (!data.motherDob || isNA(data.motherDob.day)) {
                b.addCheckbox(ID.motherDobUnk, true);
            } else {
                b.addDate(ID.motherDobDay, ID.motherDobMonth, ID.motherDobYear, data.motherDob);
            }
            b.addRadio(ID.motherInUSIndicator, data.motherInUS);
            if (data.motherInUS === 'Y' && data.motherUSStatus) {
                b.addSelect(ID.motherStatus, data.motherUSStatus);
            }

            // Immediate relatives
            b.addRadio(ID.immediateRelativeIndicator, data.immediateRelativesInUS);
            const relatives = data.relatives ?? [];
            if (data.immediateRelativesInUS === 'Y' && relatives.length > 0) {
                b.addDataList(ID.relativesList, relatives.length);
                relatives.forEach((r, i) => {
                    b.addText(ID.relativeSurname(i), r.surname, { critical: true });
                    b.addText(ID.relativeGivenName(i), r.givenName, { critical: true });
                    b.addSelect(ID.relativeType(i), r.type);
                    b.addSelect(ID.relativeStatus(i), r.status);
                });
            } else if (data.immediateRelativesInUS === 'N') {
                const anyData = data as Record<string, unknown>;
                b.addRadio(ID.otherRelativeIndicator, anyData['otherRelativesInUS']);
            }

            // Suppress unused warning
            void maritalStatus;

            const { fields, dataLists } = b.build();
            return { pageId: '12_family1', fields, dataLists };
        },
    });
}
