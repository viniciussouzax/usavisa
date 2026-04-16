// Travel Companions — see spec/actors/ceac_ds160/pages/07_travel_companions.md

export const TRAVEL_COMPANIONS_IDS = {
    travelingWithOthers: 'rblOtherPersonsTravelingWithYou',
    groupTravel: 'rblGroupTravel',
    groupName: 'tbxGroupName',
    companionsDataList: 'dlTravelCompanions',
    companionSurname: (idx: number) => `dlTravelCompanions_ctl${String(idx).padStart(2, '0')}_tbxSurname`,
    companionGivenName: (idx: number) => `dlTravelCompanions_ctl${String(idx).padStart(2, '0')}_tbxGivenName`,
    companionRelationship: (idx: number) => `dlTravelCompanions_ctl${String(idx).padStart(2, '0')}_ddlTCRelationship`,
} as const;
