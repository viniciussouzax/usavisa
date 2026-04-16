// Address and Phone — see spec/actors/ceac_ds160/pages/09_address_and_phone.md

export const ADDRESS_PHONE_IDS = {
    homeStreet1: 'tbxAPP_ADDR_LN1',
    homeStreet2: 'tbxAPP_ADDR_LN2',
    homeCity: 'tbxAPP_ADDR_CITY',
    homeState: 'tbxAPP_ADDR_STATE',
    homeStateNa: 'cbexAPP_ADDR_STATE_NA',
    homePostalCode: 'tbxAPP_ADDR_POSTAL_CD',
    homePostalCodeNa: 'cbexAPP_ADDR_POSTAL_CD_NA',
    homeCountry: 'ddlCountry',

    mailingSame: 'rblMailingAddrSame',
    mailStreet1: 'tbxMAILING_ADDR_LN1',
    mailStreet2: 'tbxMAILING_ADDR_LN2',
    mailCity: 'tbxMAILING_ADDR_CITY',
    mailState: 'tbxMAILING_ADDR_STATE',
    mailStateNa: 'cbexMAILING_ADDR_STATE_NA',
    mailPostalCode: 'tbxMAILING_ADDR_POSTAL_CD',
    mailPostalCodeNa: 'cbexMAILING_ADDR_POSTAL_CD_NA',
    mailCountry: 'ddlMailCountry',

    homeTel: 'tbxAPP_HOME_TEL',
    homeTelNa: 'cbexAPP_HOME_TEL_NA',
    mobileTel: 'tbxAPP_MOBILE_TEL',
    mobileTelNa: 'cbexAPP_MOBILE_TEL_NA',
    busTel: 'tbxAPP_BUS_TEL',
    busTelNa: 'cbexAPP_BUS_TEL_NA',

    addPhoneIndicator: 'rblAddPhone',
    addPhoneList: 'dtlAddPhone',
    addPhoneInfo: (idx: number) => `dtlAddPhone_ctl${String(idx).padStart(2, '0')}_tbxAddPhoneInfo`,

    primaryEmail: 'tbxAPP_EMAIL_ADDR',
    addEmailIndicator: 'rblAddEmail',
    addEmailList: 'dtlAddEmail',
    addEmailInfo: (idx: number) => `dtlAddEmail_ctl${String(idx).padStart(2, '0')}_tbxAddEmailInfo`,

    socialList: 'dtlSocial',
    socialPlatform: (idx: number) => `dtlSocial_ctl${String(idx).padStart(2, '0')}_ddlSocialMedia`,
    socialIdent: (idx: number) => `dtlSocial_ctl${String(idx).padStart(2, '0')}_tbxSocialMediaIdent`,

    addSocialIndicator: 'rblAddSocial',
    addSocialList: 'dtlAddSocial',
    addSocialPlat: (idx: number) => `dtlAddSocial_ctl${String(idx).padStart(2, '0')}_tbxAddSocialPlat`,
    addSocialHand: (idx: number) => `dtlAddSocial_ctl${String(idx).padStart(2, '0')}_tbxAddSocialHand`,
} as const;
