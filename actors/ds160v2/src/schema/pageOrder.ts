// Canonical order of DS-160 pages (28 modules).
// URL fingerprints let the engine classify the current state after each navigation.
// Condition gates reference fields on DS160Applicant; pages outside the baseline
// (B1/B2 adult) are only visited when their condition evaluates true.

import type { DS160Applicant } from './types.js';

export type PageId =
    | '01_apply'
    | '02_recovery'
    | '03_security_question'
    | '04_personal1'
    | '05_personal2'
    | '06_travel'
    | '07_travel_companions'
    | '08_previous_us_travel'
    | '09_address_and_phone'
    | '10_passport'
    | '11_us_contact'
    | '12_family1'
    | '13_family2_spouse'
    | '14_deceased_spouse'
    | '15_previous_spouse'
    | '16_work_education1'
    | '17_work_education2'
    | '18_work_education3'
    | '19_security_and_background'
    | '20_student_exchange_sevis'
    | '21_student_add_contact'
    | '22_temporary_work'
    | '23_photo'
    | '24_review'
    | '25_sign_and_submit'
    | '26_application_dashboard'
    | '27_print_application'
    | '28_print_confirmation';

export interface PageDescriptor {
    id: PageId;
    label: string;
    urlPatterns: RegExp[];
    // Optional gate — if omitted, page is always active for any visa class.
    isActive?: (data: DS160Applicant) => boolean;
}

export const PAGE_ORDER: PageDescriptor[] = [
    {
        id: '01_apply',
        label: 'Landing / Apply',
        urlPatterns: [/Default\.aspx/i],
    },
    {
        id: '02_recovery',
        label: 'Recovery',
        urlPatterns: [/Retrieve/i, /Recovery/i, /ConfirmApplicationID/i],
    },
    {
        id: '03_security_question',
        label: 'Security Question Setup',
        urlPatterns: [/SecureQuestion/i],
    },
    {
        id: '04_personal1',
        label: 'Personal 1',
        urlPatterns: [/complete_personal\.aspx/i, /personal1/i],
    },
    {
        id: '05_personal2',
        label: 'Personal 2',
        urlPatterns: [/personal2/i],
    },
    {
        id: '06_travel',
        label: 'Travel',
        urlPatterns: [/complete_travel\.aspx/i, /travel_info/i],
    },
    {
        id: '07_travel_companions',
        label: 'Travel Companions',
        urlPatterns: [/travelcompanions/i, /travelCompanions/i],
    },
    {
        id: '08_previous_us_travel',
        label: 'Previous US Travel',
        urlPatterns: [/previous_travel/i, /previousTravel/i],
    },
    {
        id: '09_address_and_phone',
        label: 'Address & Phone',
        urlPatterns: [/complete_contact/i, /addressphone/i],
    },
    {
        id: '10_passport',
        label: 'Passport',
        urlPatterns: [/complete_pptvisa/i, /passport/i],
    },
    {
        id: '11_us_contact',
        label: 'US Contact',
        urlPatterns: [/complete_uscontact/i],
    },
    {
        id: '12_family1',
        label: 'Family (Parents & Relatives)',
        urlPatterns: [/complete_family/i, /family1/i],
    },
    {
        id: '13_family2_spouse',
        label: 'Family (Spouse)',
        urlPatterns: [/family2/i, /spouse/i],
        isActive: (d) => ['M', 'C', 'P', 'L'].includes(d.personal1?.maritalStatus ?? ''),
    },
    {
        id: '14_deceased_spouse',
        label: 'Deceased Spouse',
        urlPatterns: [/deceased/i],
        isActive: (d) => d.personal1?.maritalStatus === 'W',
    },
    {
        id: '15_previous_spouse',
        label: 'Previous Spouse',
        urlPatterns: [/prevspouse/i, /previous_spouse/i],
        isActive: (d) => d.personal1?.maritalStatus === 'D',
    },
    {
        id: '16_work_education1',
        label: 'Work/Education (Current)',
        urlPatterns: [/complete_workedu/i, /workEdu1/i],
        isActive: (d) => !isUnder14(d),
    },
    {
        id: '17_work_education2',
        label: 'Work/Education (Previous)',
        urlPatterns: [/workEdu2/i, /previous_workedu/i],
        isActive: (d) => !isUnder14(d),
    },
    {
        id: '18_work_education3',
        label: 'Work/Education (Additional)',
        urlPatterns: [/workEdu3/i, /additional_workedu/i],
        isActive: (d) => !isUnder14(d),
    },
    {
        id: '19_security_and_background',
        label: 'Security & Background',
        urlPatterns: [/complete_securityandbackground/i, /securityandbackground/i],
    },
    {
        id: '20_student_exchange_sevis',
        label: 'Student/Exchange SEVIS',
        urlPatterns: [/student_exchange/i, /sevis/i],
        isActive: (d) => isStudentVisa(d),
    },
    {
        id: '21_student_add_contact',
        label: 'Student Add Contact',
        urlPatterns: [/student_add_contact/i, /studentaddcontact/i],
        isActive: (d) => isStudentPrincipal(d),
    },
    {
        id: '22_temporary_work',
        label: 'Temporary Work',
        urlPatterns: [/temporary_work/i, /tempwork/i],
        isActive: (d) => isTempWorkVisa(d),
    },
    {
        id: '23_photo',
        label: 'Photo Upload',
        urlPatterns: [/photo/i, /upload/i],
        isActive: (d) => requiresPhotoUpload(d),
    },
    {
        id: '24_review',
        label: 'Review',
        urlPatterns: [/review/i],
    },
    {
        id: '25_sign_and_submit',
        label: 'Sign & Submit',
        urlPatterns: [/signandsubmit/i, /sign_and_submit/i],
    },
    {
        id: '26_application_dashboard',
        label: 'Application Dashboard',
        urlPatterns: [/complete\.aspx/i, /dashboard/i],
    },
    {
        id: '27_print_application',
        label: 'Print Application',
        urlPatterns: [/printapplication/i],
    },
    {
        id: '28_print_confirmation',
        label: 'Print Confirmation',
        urlPatterns: [/printconfirmation/i, /print_confirmation/i],
    },
];

function isUnder14(data: DS160Applicant): boolean {
    const dob = data.personal1?.dob;
    if (!dob?.year) return false;
    const year = Number.parseInt(dob.year, 10);
    if (!Number.isFinite(year)) return false;
    const now = new Date();
    const age = now.getUTCFullYear() - year;
    return age < 14;
}

function isStudentVisa(data: DS160Applicant): boolean {
    const visa = data.travel?.purposeCategory?.toUpperCase() ?? '';
    return ['F', 'J', 'M'].includes(visa);
}

function isStudentPrincipal(data: DS160Applicant): boolean {
    if (!isStudentVisa(data)) return false;
    const purpose = data.travel?.purposeOfTrip?.toUpperCase() ?? '';
    return /^(F1|J1|M1)/.test(purpose);
}

function isTempWorkVisa(data: DS160Applicant): boolean {
    const purpose = data.travel?.purposeOfTrip?.toUpperCase() ?? '';
    return /^O[12]/.test(purpose);
}

function requiresPhotoUpload(data: DS160Applicant): boolean {
    const loc = data.location?.location?.toUpperCase() ?? '';
    return loc === 'PTA' || loc === 'RCF';
}

export function findPageByUrl(url: string): PageDescriptor | undefined {
    return PAGE_ORDER.find((p) => p.urlPatterns.some((re) => re.test(url)));
}

export function activePages(data: DS160Applicant): PageDescriptor[] {
    return PAGE_ORDER.filter((p) => !p.isActive || p.isActive(data));
}
