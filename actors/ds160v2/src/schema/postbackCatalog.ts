// Static metadata for ASP.NET postback triggers — facts about the CEAC DOM.
// The engine consults this catalog before any click/select to decide whether
// it must synchronize with the server (get_isInAsyncPostBack wait).
// See: spec/actors/ceac_ds160/postback_triggers.md

export type PostbackTrigger =
    | 'dropdown-any'   // any value change on this <select> triggers postback
    | 'radio-yes-only' // radio postback fires only when "Yes" is selected
    | 'radio-any'      // radio postback fires on any value
    | 'button';        // explicit postback button (Add Another, Close, etc.)

export interface PostbackSpec {
    match: 'endsWith' | 'includes';
    token: string;
    trigger: PostbackTrigger;
}

export const POSTBACK_CATALOG: PostbackSpec[] = [
    // Category 1 — dropdowns that reload sections on any change. Be specific: generic
    // "Country" over-matches ddlPayerCountry/ddlMailCountry/ddlEmpSchCountry (static).
    { match: 'includes', token: 'CNTRY', trigger: 'dropdown-any' },
    { match: 'includes', token: 'PurposeOfTrip', trigger: 'dropdown-any' },
    { match: 'includes', token: 'VisaClass', trigger: 'dropdown-any' },
    { match: 'includes', token: 'OtherPurpose', trigger: 'dropdown-any' },
    { match: 'includes', token: 'Occupation', trigger: 'dropdown-any' },
    { match: 'includes', token: 'PPT_TYPE', trigger: 'dropdown-any' },
    { match: 'includes', token: 'REL_TO_APP', trigger: 'dropdown-any' },
    { match: 'includes', token: 'POC_REL', trigger: 'dropdown-any' },
    { match: 'includes', token: 'SocialMedia', trigger: 'dropdown-any' },
    { match: 'includes', token: 'MARITAL_STATUS', trigger: 'dropdown-any' },
    { match: 'includes', token: 'APP_GENDER', trigger: 'dropdown-any' },
    { match: 'includes', token: 'WhoIsPaying', trigger: 'dropdown-any' },
    // NOTE: PayerRelationship does NOT trigger __doPostBack (confirmed in HTML snapshot);
    // it used to be flagged, but the catalog was over-matching it. Same story for
    // ddlPayerCountry/ddlMailCountry/etc — handled by removing the generic "Country" entry.
    { match: 'includes', token: 'SpouseNatDropDownList', trigger: 'dropdown-any' },
    { match: 'includes', token: 'SpouseAddressType', trigger: 'dropdown-any' },
    { match: 'includes', token: 'SpousePOBCountry', trigger: 'dropdown-any' },
    { match: 'includes', token: 'ddlLocation', trigger: 'dropdown-any' },

    // Category 2 — radios that postback only on "Yes"
    { match: 'includes', token: 'PreviouslyEmployed', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'AttendedEduc', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'OtherEduc', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_US_TRAVEL_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_US_DRIVER_LIC_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_VISA_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_VISA_REFUSED_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_VISA_LOST', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PREV_VISA_CANCELLED', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'IV_PETITION_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PERM_RESIDENT_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'VWP_DENIAL_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'AddPhone', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'AddEmail', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'AddSocial', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'AddSite', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'OTH_NATL', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'OtherNames', trigger: 'radio-yes-only' },
    // Spec/pages/07 line 10: postback fires on BOTH Y and N (select N calls __doPostBack).
    // Previously miscatalogued as yes-only; moved to category 3.
    { match: 'includes', token: 'TelecodeQuestion', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PermResOtherCntryInd', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'LOST_PPT_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'OTHER_PPT_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'FATHER_LIVE_IN_US_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'MOTHER_LIVE_IN_US_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'OTHER_RELATIVE_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'CLAN_TRIBE_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'COUNTRIES_VISITED_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'ORGANIZATION_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'SPECIALIZED_SKILLS_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'MILITARY_SERVICE_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'INSURGENT_ORG_IND', trigger: 'radio-yes-only' },
    { match: 'includes', token: 'PayerAddrSameAsInd', trigger: 'radio-yes-only' },

    // Category 3 — radios that postback on any value
    { match: 'includes', token: 'SpecificTravel', trigger: 'radio-any' },
    { match: 'includes', token: 'IMMED_RELATIVE', trigger: 'radio-any' },
    { match: 'includes', token: 'MailingAddrSame', trigger: 'radio-any' },
    { match: 'includes', token: 'MailingAddr', trigger: 'radio-any' },
    // GroupTravel postbacks on BOTH Y and N — spec confirms, catalog originally misflagged
    { match: 'includes', token: 'GroupTravel', trigger: 'radio-any' },
    // OtherPersonsTravelingWithYou: postback on BOTH Y and N (spec pages/07_travel_companions.md line 10)
    { match: 'includes', token: 'OtherPersonsTravelingWithYou', trigger: 'radio-any' },
];

export function triggersPostback(id: string, value?: string): boolean {
    const hit = POSTBACK_CATALOG.find((spec) =>
        spec.match === 'endsWith' ? id.endsWith(spec.token) : id.includes(spec.token),
    );
    if (!hit) return false;
    if (hit.trigger === 'radio-yes-only') return value === 'Y' || value === 'true';
    return true;
}

export function lookupTrigger(id: string): PostbackTrigger | undefined {
    return POSTBACK_CATALOG.find((spec) =>
        spec.match === 'endsWith' ? id.endsWith(spec.token) : id.includes(spec.token),
    )?.trigger;
}
