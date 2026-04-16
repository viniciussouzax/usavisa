// Travel — see spec/actors/ceac_ds160/pages/06_travel.md

export const TRAVEL_IDS = {
    // Purpose (cascade)
    purposeContainer: 'dlPrincipalAppTravel',
    purposeOfTrip: (idx: number) => `dlPrincipalAppTravel_ctl${String(idx).padStart(2, '0')}_ddlPurposeOfTrip`,
    otherPurpose: (idx: number) => `dlPrincipalAppTravel_ctl${String(idx).padStart(2, '0')}_ddlOtherPurpose`,
    principalSurname: (idx: number) => `dlPrincipalAppTravel_ctl${String(idx).padStart(2, '0')}_tbxPrincipleAppSurname`,
    principalGivenName: (idx: number) => `dlPrincipalAppTravel_ctl${String(idx).padStart(2, '0')}_tbxPrincipleAppGivenName`,

    // Specific plans toggle
    specificTravelIndicator: 'rblSpecificTravel',

    // Path A — specific plans (no zero-padding)
    arrivalDay: 'ddlARRIVAL_US_DTEDay',
    arrivalMonth: 'ddlARRIVAL_US_DTEMonth',
    arrivalYear: 'tbxARRIVAL_US_DTEYear',
    arrivalFlight: 'tbxArriveFlight',
    arrivalCity: 'tbxArriveCity',
    departureDay: 'ddlDEPARTURE_US_DTEDay',
    departureMonth: 'ddlDEPARTURE_US_DTEMonth',
    departureYear: 'tbxDEPARTURE_US_DTEYear',
    departureFlight: 'tbxDepartFlight',
    departureCity: 'tbxDepartCity',

    // US locations DataList
    travelLocDataList: 'dtlTravelLoc',
    travelLocInput: (idx: number) => `dtlTravelLoc_ctl${String(idx).padStart(2, '0')}_tbxSPECTRAVEL_LOCATION`,

    // Path B — no plans
    nsArrivalDay: 'ddlARRIVAL_US_NSDTEDay',
    nsArrivalMonth: 'ddlARRIVAL_US_NSDTEMonth',
    nsArrivalYear: 'tbxARRIVAL_US_NSDTEYear',
    losLength: 'tbxAPP_LOS',
    losPeriod: 'ddlAPP_LOS_CD',

    // US Address
    usStreet1: 'tbxStreetAddress1',
    usStreet2: 'tbxStreetAddress2',
    usCity: 'tbxCity',
    usState: 'ddlTravelState',
    usZip: 'tbZIPCode',

    // Who is paying
    whoIsPaying: 'ddlWhoIsPaying',
    payerSurname: 'tbxPayerSurname',
    payerGivenName: 'tbxPayerGivenName',
    payerPhone: 'tbxPayerPhone',
    payerEmail: 'tbxPAYER_EMAIL_ADDR',
    payerEmailNa: 'cbxDNAPAYER_EMAIL_ADDR_NA',
    payerRelationship: 'ddlPayerRelationship',
    payerAddressSame: 'rblPayerAddrSameAsInd',
    payerStreet1: 'tbxPayerStreetAddress1',
    payerStreet2: 'tbxPayerStreetAddress2',
    payerCity: 'tbxPayerCity',
    payerStateProvince: 'tbxPayerStateProvince',
    payerStateNa: 'cbxDNAPayerStateProvince',
    payerPostalCode: 'tbxPayerPostalZIPCode',
    payerPostalNa: 'cbxDNAPayerPostalZIPCode',
    payerCountry: 'ddlPayerCountry',
    payingCompany: 'tbxPayingCompany',
    companyRelation: 'tbxCompanyRelation',
} as const;
