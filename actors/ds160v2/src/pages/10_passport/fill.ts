import { PASSPORT_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPassportPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.passport;
    if (!data) {
        throw new EngineError('Missing passport data in payload', {
            cause: 'missing_data',
            pageName: '10_passport',
        });
    }

    return standardPageRun(ctx, {
        pageId: '10_passport',
        expectedUrlAfter: [/complete_uscontact/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addSelect(ID.type, data.type);
            if (data.type === 'T') {
                const anyData = data as Record<string, unknown>;
                b.addText(ID.otherExpl, anyData['typeExplanation']);
            }

            b.addText(ID.number, data.number, { critical: true });
            if (isNA(data.bookNumber)) {
                b.addCheckbox(ID.bookNumberNa, true);
            } else {
                b.addText(ID.bookNumber, data.bookNumber);
            }

            b.addSelectSearch(ID.issuingCountry, data.issuingCountry);
            b.addText(ID.issuedCity, data.issuedCity, { critical: true });
            b.addText(ID.issuedStateProvince, data.issuedState);
            b.addSelectSearch(ID.issuedCountry, data.issuedCountry);

            b.addDate(ID.issuanceDay, ID.issuanceMonth, ID.issuanceYear, data.issuanceDate);
            b.addDate(ID.expirationDay, ID.expirationMonth, ID.expirationYear, data.expirationDate);

            b.addRadio(ID.lostIndicator, data.lostOrStolen);
            const lost = data.lostPassports ?? [];
            if (data.lostOrStolen === 'Y' && lost.length > 0) {
                b.addDataList(ID.lostList, lost.length);
                lost.forEach((p, i) => {
                    if (isNA(p.number)) {
                        b.addCheckbox(ID.lostNumberUnk(i), true);
                    } else {
                        b.addText(ID.lostNumber(i), p.number);
                    }
                    b.addSelectSearch(ID.lostCountry(i), p.country);
                    b.addText(ID.lostExpl(i), p.explanation);
                });
            }

            const { fields, dataLists } = b.build();
            return { pageId: '10_passport', fields, dataLists };
        },
    });
}
