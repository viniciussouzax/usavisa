// Central registry of the 28 DS-160 page modules. Implemented modules point to their
// real handler; the rest use scaffoldedModule until filled in. The router picks the
// correct module by URL match and delegates execution.

import { APPLY_MODULE } from './01_apply/index.js';
import { scaffoldedModule } from './_scaffold.js';
import type { PageModule } from './types.js';
import type { PageId } from '../schema/pageOrder.js';

const ALL: PageModule[] = [
    APPLY_MODULE,
    scaffoldedModule('02_recovery'),
    scaffoldedModule('03_security_question'),
    scaffoldedModule('04_personal1'),
    scaffoldedModule('05_personal2'),
    scaffoldedModule('06_travel'),
    scaffoldedModule('07_travel_companions'),
    scaffoldedModule('08_previous_us_travel'),
    scaffoldedModule('09_address_and_phone'),
    scaffoldedModule('10_passport'),
    scaffoldedModule('11_us_contact'),
    scaffoldedModule('12_family1'),
    scaffoldedModule('13_family2_spouse'),
    scaffoldedModule('14_deceased_spouse'),
    scaffoldedModule('15_previous_spouse'),
    scaffoldedModule('16_work_education1'),
    scaffoldedModule('17_work_education2'),
    scaffoldedModule('18_work_education3'),
    scaffoldedModule('19_security_and_background'),
    scaffoldedModule('20_student_exchange_sevis'),
    scaffoldedModule('21_student_add_contact'),
    scaffoldedModule('22_temporary_work'),
    scaffoldedModule('23_photo'),
    scaffoldedModule('24_review'),
    scaffoldedModule('25_sign_and_submit'),
    scaffoldedModule('26_application_dashboard'),
    scaffoldedModule('27_print_application'),
    scaffoldedModule('28_print_confirmation'),
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
