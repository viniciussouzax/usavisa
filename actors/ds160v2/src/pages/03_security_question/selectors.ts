// Security Question setup selectors — see spec/actors/ceac_ds160/pages/03_security_question.md

export const SECURITY_QUESTION_SELECTORS = {
    // Privacy Act — mandatory postback to enable Q&A + Continue
    privacyCheckbox: 'input[id$="_chkbxPrivacyAct"]',

    // Application information (AA... code shown here)
    appIdLabel: [
        'span[id$="_lblAppID"]',
        'span[id$="_lblBarcode"]',
    ] as string[],
    appIdFallbackBold: 'b',
    dateLabel: 'span[id$="_lblDate"]',

    // Security question setup — select by index, not value
    questionSelect: 'select[id$="_ddlQuestions"]',
    answerInput: 'input[id$="_txtAnswer"]',

    // Continue
    continueButton: [
        'input[id$="_btnContinue"]:not([disabled])',
        'input[type="submit"][value*="Continue"]:not([disabled])',
        'input[type="submit"][value*="Next"]:not([disabled])',
    ] as string[],
    confirmContinueButton: 'input[id$="_btnContinueApp"]',

    validationSummary: '[id*="ValidationSummary"]',
} as const;

export const APP_ID_REGEX = /\bAA[0-9A-Z]{8}\b/;
