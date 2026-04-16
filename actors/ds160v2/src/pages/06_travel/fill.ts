import { TRAVEL_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runTravelPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.travel;
    if (!data) {
        throw new EngineError('Missing travel data in payload', {
            cause: 'missing_data',
            pageName: '06_travel',
        });
    }

    return standardPageRun(ctx, {
        pageId: '06_travel',
        expectedUrlAfter: [/travelcompanions/i, /travelCompanions/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            // Purpose cascade — payload encodes raw CEAC codes (B1/B2, F1, O1, ...)
            // Category = first char ("B") → value match on ddlPurposeOfTrip.
            // purposeOfTrip = full code ("B1/B2") → fuzzy match on ddlOtherPurpose
            // because CEAC may expose the code as the <option> label text, not the value.
            b.addSelect(ID.purposeOfTrip(0), data.purposeCategory);
            b.addSelectSearch(ID.otherPurpose(0), data.purposeOfTrip);

            // Specific plans
            b.addRadio(ID.specificTravelIndicator, data.hasSpecificPlans);

            if (data.hasSpecificPlans === 'Y') {
                // Dates on this page use NO zero-padding — travel exception (BC-1).
                b.addDate(ID.arrivalDay, ID.arrivalMonth, ID.arrivalYear, data.arrivalDate, { travel: true });
                b.addDate(ID.departureDay, ID.departureMonth, ID.departureYear, data.departureDate, { travel: true });
                b.addText(ID.arrivalFlight, data.arrivalFlight);
                b.addText(ID.arrivalCity, data.arrivalCity, { critical: true });
                b.addText(ID.departureFlight, data.departureFlight);
                b.addText(ID.departureCity, data.departureCity, { critical: true });

                const locs = data.specificLocations ?? [];
                if (locs.length > 0) {
                    b.addDataList(ID.travelLocDataList, locs.length);
                    locs.forEach((loc, i) => {
                        b.addText(ID.travelLocInput(i), loc.location);
                    });
                }
            } else if (data.hasSpecificPlans === 'N') {
                b.addDate(ID.nsArrivalDay, ID.nsArrivalMonth, ID.nsArrivalYear, data.arrivalDate, { travel: true });
                // payload may optionally carry LOS — no fabricated default
                const anyData = data as Record<string, unknown>;
                b.addText(ID.losLength, anyData['lengthOfStay']);
                b.addSelect(ID.losPeriod, anyData['lengthOfStayUnit']);
            }

            // US Address (always shown)
            b.addText(ID.usStreet1, data.usAddressStreet1, { critical: true });
            b.addText(ID.usStreet2, data.usAddressStreet2);
            b.addText(ID.usCity, data.usAddressCity, { critical: true });
            b.addSelect(ID.usState, data.usAddressState);
            b.addText(ID.usZip, data.usAddressZip);

            // Who is paying cascade
            b.addSelect(ID.whoIsPaying, data.whoIsPaying);
            const payer = data.whoIsPaying;
            if (payer === 'O') {
                b.addText(ID.payerSurname, data.payerSurname, { critical: true });
                b.addText(ID.payerGivenName, data.payerGivenName, { critical: true });
                b.addText(ID.payerPhone, data.payerPhone, { critical: true });
                if (isNA(data.payerEmail)) {
                    b.addCheckbox(ID.payerEmailNa, true);
                } else {
                    b.addText(ID.payerEmail, data.payerEmail);
                }
                b.addSelect(ID.payerRelationship, data.payerRelationship);
                b.addRadio(ID.payerAddressSame, data.payerSameAddress);
                if (data.payerSameAddress === 'N') {
                    b.addText(ID.payerStreet1, data.payerPersonStreet1, { critical: true });
                    b.addText(ID.payerStreet2, data.payerPersonStreet2);
                    b.addText(ID.payerCity, data.payerPersonCity, { critical: true });
                    if (isNA(data.payerPersonState)) {
                        b.addCheckbox(ID.payerStateNa, true);
                    } else {
                        b.addText(ID.payerStateProvince, data.payerPersonState);
                    }
                    if (isNA(data.payerPersonPostalCode)) {
                        b.addCheckbox(ID.payerPostalNa, true);
                    } else {
                        b.addText(ID.payerPostalCode, data.payerPersonPostalCode);
                    }
                    b.addSelectSearch(ID.payerCountry, data.payerPersonCountry);
                }
            } else if (payer === 'P' || payer === 'U' || payer === 'C') {
                const anyData = data as Record<string, unknown>;
                b.addText(ID.payingCompany, anyData['payingCompany']);
                b.addText(ID.payerPhone, anyData['payerPhone']);
                b.addText(ID.companyRelation, anyData['companyRelation']);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '06_travel', fields, dataLists };
        },
    });
}
