// Passport — see spec/actors/ceac_ds160/pages/10_passport.md

export const PASSPORT_IDS = {
    type: 'ddlPPT_TYPE',
    otherExpl: 'tbxPptOtherExpl',
    number: 'tbxPPT_NUM',
    bookNumber: 'tbxPPT_BOOK_NUM',
    bookNumberNa: 'cbexPPT_BOOK_NUM_NA',
    issuingCountry: 'ddlPPT_ISSUED_CNTRY',
    issuedCity: 'tbxPPT_ISSUED_IN_CITY',
    issuedStateProvince: 'tbxPPT_ISSUED_IN_STATE',
    issuedCountry: 'ddlPPT_ISSUED_IN_CNTRY',
    issuanceDay: 'ddlPPT_ISSUED_DTEDay',
    issuanceMonth: 'ddlPPT_ISSUED_DTEMonth',
    issuanceYear: 'tbxPPT_ISSUEDYear',
    expirationDay: 'ddlPPT_EXPIRE_DTEDay',
    expirationMonth: 'ddlPPT_EXPIRE_DTEMonth',
    expirationYear: 'tbxPPT_EXPIREYear',
    expirationNa: 'cbxPPT_EXPIRE_NA',

    lostIndicator: 'rblLOST_PPT_IND',
    lostList: 'dtlLostPPT',
    lostNumber: (idx: number) => `dtlLostPPT_ctl${String(idx).padStart(2, '0')}_tbxLOST_PPT_NUM`,
    lostNumberUnk: (idx: number) => `dtlLostPPT_ctl${String(idx).padStart(2, '0')}_cbxLOST_PPT_NUM_UNKN_IND`,
    lostCountry: (idx: number) => `dtlLostPPT_ctl${String(idx).padStart(2, '0')}_ddlLOST_PPT_NATL`,
    lostExpl: (idx: number) => `dtlLostPPT_ctl${String(idx).padStart(2, '0')}_tbxLOST_PPT_EXPL`,
} as const;
