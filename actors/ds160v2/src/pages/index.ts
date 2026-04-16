// Central registry of the 28 DS-160 page modules. Each maps URL patterns to a handler.

import { APPLY_MODULE } from './01_apply/index.js';
import { RECOVERY_MODULE } from './02_recovery/index.js';
import { SECURITY_QUESTION_MODULE } from './03_security_question/index.js';
import { PERSONAL1_MODULE } from './04_personal1/index.js';
import { PERSONAL2_MODULE } from './05_personal2/index.js';
import { TRAVEL_MODULE } from './06_travel/index.js';
import { TRAVEL_COMPANIONS_MODULE } from './07_travel_companions/index.js';
import { PREV_US_TRAVEL_MODULE } from './08_previous_us_travel/index.js';
import { ADDRESS_PHONE_MODULE } from './09_address_and_phone/index.js';
import { PASSPORT_MODULE } from './10_passport/index.js';
import { US_CONTACT_MODULE } from './11_us_contact/index.js';
import { FAMILY1_MODULE } from './12_family1/index.js';
import { FAMILY2_SPOUSE_MODULE } from './13_family2_spouse/index.js';
import { DECEASED_SPOUSE_MODULE } from './14_deceased_spouse/index.js';
import { PREV_SPOUSE_MODULE } from './15_previous_spouse/index.js';
import { WORK_EDU1_MODULE } from './16_work_education1/index.js';
import { WORK_EDU2_MODULE } from './17_work_education2/index.js';
import { WORK_EDU3_MODULE } from './18_work_education3/index.js';
import { SECURITY_BACKGROUND_MODULE } from './19_security_and_background/index.js';
import { STUDENT_SEVIS_MODULE } from './20_student_exchange_sevis/index.js';
import { STUDENT_ADD_CONTACT_MODULE } from './21_student_add_contact/index.js';
import { TEMPORARY_WORK_MODULE } from './22_temporary_work/index.js';
import { PHOTO_MODULE } from './23_photo/index.js';
import { REVIEW_MODULE } from './24_review/index.js';
import { SIGN_MODULE } from './25_sign_and_submit/index.js';
import { APPLICATION_DASHBOARD_MODULE } from './26_application_dashboard/index.js';
import { PRINT_APPLICATION_MODULE } from './27_print_application/index.js';
import { PRINT_CONFIRMATION_MODULE } from './28_print_confirmation/index.js';

import type { PageModule } from './types.js';
import type { PageId } from '../schema/pageOrder.js';

const ALL: PageModule[] = [
    APPLY_MODULE,
    RECOVERY_MODULE,
    SECURITY_QUESTION_MODULE,
    PERSONAL1_MODULE,
    PERSONAL2_MODULE,
    TRAVEL_MODULE,
    TRAVEL_COMPANIONS_MODULE,
    PREV_US_TRAVEL_MODULE,
    ADDRESS_PHONE_MODULE,
    PASSPORT_MODULE,
    US_CONTACT_MODULE,
    FAMILY1_MODULE,
    FAMILY2_SPOUSE_MODULE,
    DECEASED_SPOUSE_MODULE,
    PREV_SPOUSE_MODULE,
    WORK_EDU1_MODULE,
    WORK_EDU2_MODULE,
    WORK_EDU3_MODULE,
    SECURITY_BACKGROUND_MODULE,
    STUDENT_SEVIS_MODULE,
    STUDENT_ADD_CONTACT_MODULE,
    TEMPORARY_WORK_MODULE,
    PHOTO_MODULE,
    REVIEW_MODULE,
    SIGN_MODULE,
    APPLICATION_DASHBOARD_MODULE,
    PRINT_APPLICATION_MODULE,
    PRINT_CONFIRMATION_MODULE,
];

export const PAGE_MODULES: Record<PageId, PageModule> = ALL.reduce(
    (acc, m) => {
        acc[m.id] = m;
        return acc;
    },
    {} as Record<PageId, PageModule>,
);

export function listPageModules(): PageModule[] {
    return [...ALL];
}
