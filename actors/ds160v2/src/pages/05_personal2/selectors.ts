// Personal 2 — see spec/actors/ceac_ds160/pages/05_personal2.md

export const PERSONAL2_IDS = {
    nationality: 'ddlAPP_NATL',

    otherNationalityIndicator: 'rblAPP_OTH_NATL_IND',
    otherNationalityDataList: 'dtlOTHER_NATL',
    otherNationalityCountry: (idx: number) => `dtlOTHER_NATL_ctl${String(idx).padStart(2, '0')}_ddlOTHER_NATL`,
    otherNationalityHasPpt: (idx: number) => `dtlOTHER_NATL_ctl${String(idx).padStart(2, '0')}_rblOTHER_PPT_IND`,
    otherNationalityPptNum: (idx: number) => `dtlOTHER_NATL_ctl${String(idx).padStart(2, '0')}_tbxOTHER_PPT_NUM`,

    permResOtherCountryIndicator: 'rblPermResOtherCntryInd',
    permResOtherCountryDataList: 'dtlOthPermResCntry',
    permResOtherCountry: (idx: number) => `dtlOthPermResCntry_ctl${String(idx).padStart(2, '0')}_ddlOthPermResCntry`,

    nationalId: 'tbxAPP_NATIONAL_ID',
    nationalIdNa: 'cbexAPP_NATIONAL_ID_NA',
    ssn1: 'tbxAPP_SSN1',
    ssn2: 'tbxAPP_SSN2',
    ssn3: 'tbxAPP_SSN3',
    ssnNa: 'cbexAPP_SSN_NA',
    taxId: 'tbxAPP_TAX_ID',
    taxIdNa: 'cbexAPP_TAX_ID_NA',
} as const;
