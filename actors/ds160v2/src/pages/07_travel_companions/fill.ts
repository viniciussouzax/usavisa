import { TRAVEL_COMPANIONS_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runTravelCompanionsPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.travelCompanions;
    if (!data) {
        throw new EngineError('Missing travelCompanions data in payload', {
            cause: 'missing_data',
            pageName: '07_travel_companions',
        });
    }

    return standardPageRun(ctx, {
        pageId: '07_travel_companions',
        expectedUrlAfter: [/previous_travel/i, /previousTravel/i, /previoustravel/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addRadio(ID.travelingWithOthers, data.travelingWithOthers);
            if (data.travelingWithOthers === 'Y') {
                b.addRadio(ID.groupTravel, data.partOfGroup);
                if (data.partOfGroup === 'Y' && data.groupName) {
                    b.addText(ID.groupName, data.groupName);
                } else if (data.partOfGroup === 'N') {
                    const companions = data.companions ?? [];
                    if (companions.length > 0) {
                        b.addDataList(ID.companionsDataList, companions.length);
                        companions.forEach((c, i) => {
                            b.addText(ID.companionSurname(i), c.surname, { critical: true });
                            b.addText(ID.companionGivenName(i), c.givenName, { critical: true });
                            b.addSelect(ID.companionRelationship(i), c.relationship);
                        });
                    }
                }
            }

            const { fields, dataLists } = b.build();
            return { pageId: '07_travel_companions', fields, dataLists };
        },
    });
}
