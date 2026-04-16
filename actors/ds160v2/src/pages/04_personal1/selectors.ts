// Personal 1 — field id suffixes (prefix ctl00_SiteContentPlaceHolder_FormView1_ is implicit).
// See spec/actors/ceac_ds160/pages/04_personal1.md

export const PERSONAL1_IDS = {
    surname: 'tbxAPP_SURNAME',
    givenName: 'tbxAPP_GIVEN_NAME',
    fullNameNative: 'tbxAPP_FULL_NAME_NATIVE',
    fullNameNativeNa: 'cbexAPP_FULL_NAME_NATIVE_NA',

    otherNamesIndicator: 'rblOtherNames',
    aliasDataList: 'DListAlias',
    aliasSurname: (idx: number) => `DListAlias_ctl${String(idx).padStart(2, '0')}_tbxSURNAME`,
    aliasGivenName: (idx: number) => `DListAlias_ctl${String(idx).padStart(2, '0')}_tbxGIVEN_NAME`,

    telecodeIndicator: 'rblTelecodeQuestion',
    telecodeSurname: 'tbxAPP_TelecodeSURNAME',
    telecodeGivenName: 'tbxAPP_TelecodeGIVEN_NAME',

    sex: 'ddlAPP_GENDER',
    maritalStatus: 'ddlAPP_MARITAL_STATUS',
    otherMaritalStatus: 'tbxOtherMaritalStatus',

    dobDay: 'ddlDOBDay',
    dobMonth: 'ddlDOBMonth',
    dobYear: 'tbxDOBYear',

    pobCity: 'tbxAPP_POB_CITY',
    pobStateProvince: 'tbxAPP_POB_ST_PROVINCE',
    pobStateProvinceNa: 'cbexAPP_POB_ST_PROVINCE_NA',
    pobCountry: 'ddlAPP_POB_CNTRY',
} as const;
