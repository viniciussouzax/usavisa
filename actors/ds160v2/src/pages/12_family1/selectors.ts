// Family 1 (Parents + Relatives) — see spec/actors/ceac_ds160/pages/12_family1.md

export const FAMILY1_IDS = {
    fatherSurname: 'tbxFATHER_SURNAME',
    fatherSurnameUnk: 'cbxFATHER_SURNAME_UNK_IND',
    fatherGivenName: 'tbxFATHER_GIVEN_NAME',
    fatherGivenNameUnk: 'cbxFATHER_GIVEN_NAME_UNK_IND',
    fatherDobDay: 'ddlFathersDOBDay',
    fatherDobMonth: 'ddlFathersDOBMonth',
    fatherDobYear: 'tbxFathersDOBYear',
    fatherDobUnk: 'cbxFATHER_DOB_UNK_IND',
    fatherInUSIndicator: 'rblFATHER_LIVE_IN_US_IND',
    fatherStatus: 'ddlFATHER_US_STATUS',

    motherSurname: 'tbxMOTHER_SURNAME',
    motherSurnameUnk: 'cbxMOTHER_SURNAME_UNK_IND',
    motherGivenName: 'tbxMOTHER_GIVEN_NAME',
    motherGivenNameUnk: 'cbxMOTHER_GIVEN_NAME_UNK_IND',
    motherDobDay: 'ddlMothersDOBDay',
    motherDobMonth: 'ddlMothersDOBMonth',
    motherDobYear: 'tbxMothersDOBYear',
    motherDobUnk: 'cbxMOTHER_DOB_UNK_IND',
    motherInUSIndicator: 'rblMOTHER_LIVE_IN_US_IND',
    motherStatus: 'ddlMOTHER_US_STATUS',

    immediateRelativeIndicator: 'rblUS_IMMED_RELATIVE_IND',
    otherRelativeIndicator: 'rblUS_OTHER_RELATIVE_IND',
    relativesList: 'dlUSRelatives',
    relativeSurname: (idx: number) => `dlUSRelatives_ctl${String(idx).padStart(2, '0')}_tbxUS_REL_SURNAME`,
    relativeGivenName: (idx: number) => `dlUSRelatives_ctl${String(idx).padStart(2, '0')}_tbxUS_REL_GIVEN_NAME`,
    relativeType: (idx: number) => `dlUSRelatives_ctl${String(idx).padStart(2, '0')}_ddlUS_REL_TYPE`,
    relativeStatus: (idx: number) => `dlUSRelatives_ctl${String(idx).padStart(2, '0')}_ddlUS_REL_STATUS`,
} as const;
