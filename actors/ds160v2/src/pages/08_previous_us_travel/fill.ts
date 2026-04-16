import { PREV_US_TRAVEL_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import { isNA } from '../../schema/sentinels.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runPreviousUSTravelPage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.previousUSTravel;
    if (!data) {
        throw new EngineError('Missing previousUSTravel data in payload', {
            cause: 'missing_data',
            pageName: '08_previous_us_travel',
        });
    }

    return standardPageRun(ctx, {
        pageId: '08_previous_us_travel',
        expectedUrlAfter: [/complete_contact|addressphone/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addRadio(ID.hasBeenInUSIndicator, data.hasBeenInUS);
            if (data.hasBeenInUS === 'Y') {
                const visits = data.previousVisits ?? [];
                if (visits.length > 0) {
                    b.addDataList(ID.visitsDataList, visits.length);
                    visits.forEach((v, i) => {
                        b.addSelect(ID.visitArrivalDay(i), padDayLoose(v.arrivalDate.day));
                        b.addSelect(ID.visitArrivalMonth(i), monthToIndex(v.arrivalDate.month));
                        b.addText(ID.visitArrivalYear(i), v.arrivalDate.year);
                        b.addText(ID.visitLosLength(i), v.lengthOfStay);
                        b.addSelect(ID.visitLosUnit(i), v.lengthOfStayUnit);
                    });
                }

                b.addRadio(ID.hasDriversLicenseIndicator, data.hasDriversLicense);
                if (data.hasDriversLicense === 'Y') {
                    const lic = data.driversLicenses ?? [];
                    if (lic.length > 0) {
                        b.addDataList(ID.licenseDataList, lic.length);
                        lic.forEach((l, i) => {
                            if (isNA(l.number)) {
                                b.addCheckbox(ID.licenseNumberNa(i), true);
                            } else {
                                b.addText(ID.licenseNumber(i), l.number);
                            }
                            b.addSelectSearch(ID.licenseState(i), l.state);
                        });
                    }
                }
            }

            b.addRadio(ID.hasVisaIndicator, data.hasUSVisa);
            if (data.hasUSVisa === 'Y') {
                // Same "no zero-padding" date rule as Travel page.
                b.addDate(ID.visaIssueDay, ID.visaIssueMonth, ID.visaIssueYear, data.previousVisaIssueDate, { travel: true });
                if (isNA(data.previousVisaNumber)) {
                    b.addCheckbox(ID.visaFoilNumberNa, true);
                } else {
                    b.addText(ID.visaFoilNumber, data.previousVisaNumber);
                }
                b.addRadio(ID.sameTypeIndicator, data.sameVisaType);
                b.addRadio(ID.sameCountryIndicator, data.sameCountry);
                b.addRadio(ID.tenPrintIndicator, data.tenPrint);

                b.addRadio(ID.visaLostIndicator, data.visaLost);
                if (data.visaLost === 'Y') {
                    b.addText(ID.visaLostYear, data.lostVisaYear);
                    b.addText(ID.visaLostExpl, data.lostVisaExplanation);
                }
                b.addRadio(ID.visaCancelledIndicator, data.visaCancelled);
                if (data.visaCancelled === 'Y') {
                    b.addText(ID.visaCancelledExpl, data.cancelledExplanation);
                }
                b.addRadio(ID.visaRefusedIndicator, data.visaRefused);
                if (data.visaRefused === 'Y') {
                    b.addText(ID.visaRefusedExpl, data.visaRefusedExplanation);
                }
            }

            b.addRadio(ID.vwpDenialIndicator, data.vwpDenial);
            if (data.vwpDenial === 'Y') {
                b.addText(ID.vwpDenialExpl, data.vwpDenialExplanation);
            }

            b.addRadio(ID.ivPetitionIndicator, data.immigrantPetition);
            if (data.immigrantPetition === 'Y') {
                b.addText(ID.ivPetitionExpl, data.immigrantPetitionExplanation);
            }

            const { fields, dataLists } = b.build();
            return { pageId: '08_previous_us_travel', fields, dataLists };
        },
    });
}

function padDayLoose(day: string): string {
    const n = Number.parseInt(day, 10);
    if (!Number.isFinite(n)) return day;
    return String(n);
}

function monthToIndex(month: string): string {
    const codes = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const idx = codes.indexOf(month.toUpperCase());
    return idx >= 0 ? String(idx + 1) : month;
}
