// Previous US Travel — see spec/actors/ceac_ds160/pages/08_previous_us_travel.md

export const PREV_US_TRAVEL_IDS = {
    hasBeenInUSIndicator: 'rblPREV_US_TRAVEL_IND',
    visitsDataList: 'dtlPREV_US_VISIT',
    visitArrivalDay: (idx: number) => `dtlPREV_US_VISIT_ctl${String(idx).padStart(2, '0')}_ddlPREV_US_VISIT_DTEDay`,
    visitArrivalMonth: (idx: number) => `dtlPREV_US_VISIT_ctl${String(idx).padStart(2, '0')}_ddlPREV_US_VISIT_DTEMonth`,
    visitArrivalYear: (idx: number) => `dtlPREV_US_VISIT_ctl${String(idx).padStart(2, '0')}_tbxPREV_US_VISIT_DTEYear`,
    visitLosLength: (idx: number) => `dtlPREV_US_VISIT_ctl${String(idx).padStart(2, '0')}_tbxPREV_US_VISIT_LOS`,
    visitLosUnit: (idx: number) => `dtlPREV_US_VISIT_ctl${String(idx).padStart(2, '0')}_ddlPREV_US_VISIT_LOS_CD`,

    hasDriversLicenseIndicator: 'rblPREV_US_DRIVER_LIC_IND',
    licenseDataList: 'dtlUS_DRIVER_LICENSE',
    licenseNumber: (idx: number) => `dtlUS_DRIVER_LICENSE_ctl${String(idx).padStart(2, '0')}_tbxUS_DRIVER_LICENSE`,
    licenseNumberNa: (idx: number) => `dtlUS_DRIVER_LICENSE_ctl${String(idx).padStart(2, '0')}_cbxUS_DRIVER_LICENSE_NA`,
    licenseState: (idx: number) => `dtlUS_DRIVER_LICENSE_ctl${String(idx).padStart(2, '0')}_ddlUS_DRIVER_LICENSE_STATE`,

    hasVisaIndicator: 'rblPREV_VISA_IND',
    visaIssueDay: 'ddlPREV_VISA_ISSUED_DTEDay',
    visaIssueMonth: 'ddlPREV_VISA_ISSUED_DTEMonth',
    visaIssueYear: 'tbxPREV_VISA_ISSUED_DTEYear',
    visaFoilNumber: 'tbxPREV_VISA_FOIL_NUMBER',
    visaFoilNumberNa: 'cbxPREV_VISA_FOIL_NUMBER_NA',
    sameTypeIndicator: 'rblPREV_VISA_SAME_TYPE_IND',
    sameCountryIndicator: 'rblPREV_VISA_SAME_CNTRY_IND',
    tenPrintIndicator: 'rblPREV_VISA_TEN_PRINT_IND',

    visaLostIndicator: 'rblPREV_VISA_LOST_IND',
    visaLostYear: 'tbxPREV_VISA_LOST_YEAR',
    visaLostExpl: 'tbxPREV_VISA_LOST_EXPL',
    visaCancelledIndicator: 'rblPREV_VISA_CANCELLED_IND',
    visaCancelledExpl: 'tbxPREV_VISA_CANCELLED_EXPL',
    visaRefusedIndicator: 'rblPREV_VISA_REFUSED_IND',
    visaRefusedExpl: 'tbxPREV_VISA_REFUSED_EXPL',

    vwpDenialIndicator: 'rblVWP_DENIAL_IND',
    vwpDenialExpl: 'tbxVWP_DENIAL_EXPL',

    ivPetitionIndicator: 'rblIV_PETITION_IND',
    ivPetitionExpl: 'tbxIV_PETITION_EXPL',
} as const;
