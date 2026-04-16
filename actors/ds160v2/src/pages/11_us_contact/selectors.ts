// US Contact — see spec/actors/ceac_ds160/pages/11_us_contact.md

export const US_CONTACT_IDS = {
    surname: 'tbxUS_POC_SURNAME',
    givenName: 'tbxUS_POC_GIVEN_NAME',
    nameNa: 'cbxUS_POC_NAME_NA',
    organization: 'tbxUS_POC_ORGANIZATION',
    orgNa: 'cbxUS_POC_ORG_NA_IND',
    relationship: 'ddlUS_POC_REL_TO_APP',
    street1: 'tbxUS_POC_ADDR_LN1',
    street2: 'tbxUS_POC_ADDR_LN2',
    city: 'tbxUS_POC_ADDR_CITY',
    state: 'ddlUS_POC_ADDR_STATE',
    zip: 'tbxUS_POC_ADDR_POSTAL_CD',
    phone: 'tbxUS_POC_HOME_TEL',
    email: 'tbxUS_POC_EMAIL_ADDR',
    emailNa: 'cbexUS_POC_EMAIL_ADDR_NA',
} as const;
