// Shared copy of DS-160 applicant contract. Canonical source lives in the actor repo:
// actors/ds160v2/src/schema/types.ts — kept in sync manually until we add a build-time
// sync script. Whenever the actor schema changes, mirror the change here.

export type YesNo = 'Y' | 'N';

export type MaritalStatus = 'S' | 'M' | 'C' | 'P' | 'D' | 'W' | 'L' | 'O';

export type Sex = 'M' | 'F';

export interface CeacDate {
    day: string;
    month: string;
    year: string;
}

export interface DS160Meta {
    naFields?: string[];
    unknownFields?: string[];
    visitedSections?: number[];
}

export interface DS160Applicant {
    _meta?: DS160Meta;

    location?: { location: string };

    personal1?: {
        surname: string;
        givenName: string;
        fullNameNative: string;
        otherNamesUsed: YesNo;
        otherNames?: Array<{ surname: string; givenName: string }>;
        telecode: YesNo;
        telecodeSurname?: string;
        telecodeGivenName?: string;
        sex: Sex;
        maritalStatus: MaritalStatus;
        dob: CeacDate;
        cityOfBirth: string;
        stateOfBirth: string;
        countryOfBirth: string;
    };

    personal2?: {
        nationality: string;
        otherNationality: YesNo;
        otherNationalities?: Array<{ country: string; hasPassport: YesNo; passportNumber?: string }>;
        permanentResident: YesNo;
        permanentResidentCountries?: Array<{ country: string }>;
        ssn?: { p1?: string; p2?: string; p3?: string } | string;
        taxId?: string;
        nationalId?: string;
    };

    travel?: {
        purposeOfTrip: string;
        purposeCategory: string;
        hasSpecificPlans: YesNo;
        arrivalDate?: CeacDate;
        departureDate?: CeacDate;
        arrivalFlight?: string;
        departureFlight?: string;
        arrivalCity?: string;
        departureCity?: string;
        specificLocations?: Array<{ location: string }>;
        usAddressStreet1?: string;
        usAddressStreet2?: string;
        usAddressCity?: string;
        usAddressState?: string;
        usAddressZip?: string;
        whoIsPaying: string;
        payerSurname?: string;
        payerGivenName?: string;
        payerRelationship?: string;
        payerEmail?: string;
        payerPhone?: string;
        payerSameAddress?: YesNo;
        payerPersonStreet1?: string;
        payerPersonStreet2?: string;
        payerPersonCity?: string;
        payerPersonState?: string;
        payerPersonPostalCode?: string;
        payerPersonCountry?: string;
    };

    travelCompanions?: {
        travelingWithOthers: YesNo;
        partOfGroup?: YesNo;
        groupName?: string;
        companions?: Array<{ surname: string; givenName: string; relationship: string }>;
    };

    previousUSTravel?: {
        hasBeenInUS: YesNo;
        previousVisits?: Array<{ arrivalDate: CeacDate; lengthOfStay: string; lengthOfStayUnit: string }>;
        hasDriversLicense?: YesNo;
        driversLicenses?: Array<{ state: string; number: string }>;
        hasUSVisa?: YesNo;
        previousVisaNumber?: string;
        previousVisaIssueDate?: CeacDate;
        sameVisaType?: YesNo;
        sameCountry?: YesNo;
        tenPrint?: YesNo;
        visaLost?: YesNo;
        lostVisaYear?: string;
        lostVisaExplanation?: string;
        visaCancelled?: YesNo;
        cancelledExplanation?: string;
        visaRefused?: YesNo;
        visaRefusedExplanation?: string;
        vwpDenial?: YesNo;
        vwpDenialExplanation?: string;
        immigrantPetition?: YesNo;
        immigrantPetitionExplanation?: string;
    };

    addressPhone?: {
        homeStreet1: string;
        homeStreet2?: string;
        homeCity: string;
        homeState: string;
        homePostalCode: string;
        homeCountry: string;
        mailingAddressSame: YesNo;
        mailStreet1?: string;
        mailStreet2?: string;
        mailCity?: string;
        mailState?: string;
        mailPostalCode?: string;
        mailCountry?: string;
        phone: string;
        mobilePhone?: string;
        businessPhone?: string;
        additionalPhones?: YesNo;
        additionalPhoneNumbers?: Array<{ phone: string }>;
        email: string;
        additionalEmails?: YesNo;
        additionalEmailAddresses?: Array<{ email: string }>;
        socialMedia?: Array<{ platform: string; handle: string }>;
        additionalSocialMedia?: YesNo;
        additionalSocialMediaAccounts?: Array<{ platform: string; handle: string }>;
    };

    passport?: {
        type: string;
        number: string;
        bookNumber?: string;
        issuingCountry: string;
        issuedCity: string;
        issuedState?: string;
        issuedCountry: string;
        issuanceDate: CeacDate;
        expirationDate: CeacDate;
        lostOrStolen: YesNo;
        lostPassports?: Array<{ number: string; country: string; explanation: string }>;
    };

    usContact?: {
        contactType: string;
        surname?: string;
        givenName?: string;
        organization?: string;
        relationship: string;
        usContactStreet1: string;
        usContactStreet2?: string;
        usContactCity: string;
        usContactState: string;
        usContactZip: string;
        usContactPhone: string;
        usContactEmail?: string;
    };

    family1?: {
        fatherSurname: string;
        fatherGivenName: string;
        fatherDob: CeacDate;
        fatherInUS: YesNo;
        fatherUSStatus?: string;
        motherSurname: string;
        motherGivenName: string;
        motherDob: CeacDate;
        motherInUS: YesNo;
        motherUSStatus?: string;
        immediateRelativesInUS: YesNo;
        relatives?: Array<{ surname: string; givenName: string; type: string; status: string }>;
    };

    spouse?: {
        surname: string;
        givenName: string;
        dob: CeacDate;
        nationality: string;
        cityOfBirth: string;
        countryOfBirth: string;
        addressType: string;
    };

    deceasedSpouse?: {
        surname: string;
        givenName: string;
        dob: CeacDate;
        nationality: string;
        cityOfBirth: string;
        countryOfBirth: string;
    };

    previousSpouses?: Array<{
        surname: string;
        givenName: string;
        dob: CeacDate;
        nationality: string;
    }>;

    workEducation1?: {
        occupation: string;
        otherOccupation?: string;
        employerName?: string;
        employerStreet1?: string;
        employerStreet2?: string;
        employerCity?: string;
        employerState?: string;
        employerPostalCode?: string;
        employerCountry?: string;
        employerPhone?: string;
        employerStartDate?: CeacDate;
        monthlySalary?: string;
        duties?: string;
    };

    workEducation2?: {
        hasPreviousEmployment: YesNo;
        previousEmployment?: Array<{
            name: string;
            jobTitle: string;
            duties: string;
            supervisor: string;
            supervisorGivenName?: string;
            startDate: CeacDate;
            endDate: CeacDate;
            prevEmplStreet1: string;
            prevEmplStreet2?: string;
            prevEmplCity: string;
            prevEmplState: string;
            prevEmplPostalCode: string;
            prevEmplCountry: string;
            prevEmplPhone: string;
        }>;
        hasEducation: YesNo;
        education?: Array<{
            name: string;
            course: string;
            startDate: CeacDate;
            endDate: CeacDate;
            schoolStreet1: string;
            schoolStreet2?: string;
            schoolCity: string;
            schoolState: string;
            schoolPostalCode: string;
            schoolCountry: string;
        }>;
    };

    workEducation3?: {
        clanTribe: YesNo;
        languages?: Array<{ name: string }>;
        countriesVisited: YesNo;
        countriesVisitedList?: Array<{ country: string }>;
        organizationMember: YesNo;
        organizations?: Array<{ name: string }>;
        specializedSkills: YesNo;
        specializedSkillsExplanation?: string;
        militaryService: YesNo;
        military?: Array<{
            country: string;
            branch: string;
            rank: string;
            specialty: string;
            startDate: CeacDate;
            endDate: CeacDate;
        }>;
        insurgentOrg: YesNo;
        insurgentOrgExplanation?: string;
    };

    security?: Record<string, YesNo>;

    studentSevis?: {
        sevisId?: string;
        programNumber?: string;
        schoolName?: string;
        schoolStreet1?: string;
        schoolStreet2?: string;
        schoolCity?: string;
        schoolState?: string;
        schoolPostalCode?: string;
        schoolCountry?: string;
        courseOfStudy?: string;
    };

    studentContact?: {
        contact1Surname?: string;
        contact1GivenName?: string;
        contact1Phone?: string;
        contact1Email?: string;
        contact2Surname?: string;
        contact2GivenName?: string;
        contact2Phone?: string;
        contact2Email?: string;
    };

    temporaryWork?: {
        petitionNumber?: string;
        employerName?: string;
        jobTitle?: string;
        monthlySalary?: string;
    };

    photo?: {
        path?: string;
        base64?: string;
        url?: string;
    };

    signAndSubmit?: {
        signature?: string;
    };

    recovery?: {
        applicationId?: string;
        securityAnswer?: string;
    };
}

export interface ActorInput {
    taskId?: string;
    applicationId?: string;
    applicant?: DS160Applicant;
    mode?: 'real' | 'dry_run';
    captchaMode?: 'capmonster' | 'ai_vision';
    credentials?: {
        capmonsterApiKey?: string;
    };
}
