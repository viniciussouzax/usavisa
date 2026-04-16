// Definition of Ready — gate executed BEFORE opening the browser.
// If any of the 11 mandatory fields is missing, the worker marks error without spending
// a browser session. See spec/actors/ceac_ds160/worker_rules.md §11.

import type { DS160Applicant } from '../schema/types.js';
import { isNA } from '../schema/sentinels.js';

export interface DoRFailure {
    field: string;
    reason: 'missing' | 'sentinel';
}

export function checkDefinitionOfReady(data: DS160Applicant | undefined): DoRFailure[] {
    if (!data) return [{ field: 'applicant', reason: 'missing' }];
    const failures: DoRFailure[] = [];

    const gate = (path: string, value: unknown): void => {
        if (value === undefined || value === null) {
            failures.push({ field: path, reason: 'missing' });
        } else if (isNA(value)) {
            failures.push({ field: path, reason: 'sentinel' });
        }
    };

    gate('location.location', data.location?.location);

    const p1 = data.personal1;
    gate('personal1.surname', p1?.surname);
    gate('personal1.givenName', p1?.givenName);
    gate('personal1.fullNameNative', p1?.fullNameNative);
    gate('personal1.otherNamesUsed', p1?.otherNamesUsed);
    gate('personal1.telecode', p1?.telecode);
    gate('personal1.sex', p1?.sex);
    gate('personal1.maritalStatus', p1?.maritalStatus);

    const dob = p1?.dob;
    if (!dob?.day || !dob?.month || !dob?.year) {
        failures.push({ field: 'personal1.dob', reason: 'missing' });
    }

    gate('personal1.cityOfBirth', p1?.cityOfBirth);
    gate('personal1.stateOfBirth', p1?.stateOfBirth);
    gate('personal1.countryOfBirth', p1?.countryOfBirth);

    return failures;
}
