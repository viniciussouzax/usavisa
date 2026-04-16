// Recovery (Retrieve Application) selectors — facts from spec/actors/ceac_ds160/pages/02_recovery.md.

export const RECOVERY_SELECTORS = {
    // Phase 1 — Application ID + CAPTCHA
    applicationIdInput: 'input[id$="_tbxApplicationID"]',
    captchaImage: [
        'img[id$="_CaptchaImage"]',
        'img[src*="captcha"]',
        '.LBD_CaptchaImage',
    ] as string[],
    captchaInput: [
        'input[id$="_IdentifyCaptchaLand1_txtCodeTextBox"]',
        'input[id$="_txtCodeTextBox"]',
    ] as string[],
    submitPhase1: [
        'input[id$="_btnBarcodeSubmit"]',
        'input[id$="_btnRetrieve"]',
        'a[id$="_lnkRetrieve"]',
        'input[value*="Retrieve"]',
    ] as string[],

    // Phase 2 — Security Questions (identity verification)
    locationSelect: 'select[id$="_ddlLocation"]',
    surnameInput: 'input[id$="_txbSurname"]',
    dobYearInput: 'input[id$="_txbDOBYear"]',
    surnameInputShort: 'input[id$="_txbSname"]',
    yearInputShort: 'input[id$="_txbYear"]',
    answerInput: 'input[id$="_txbAnswer"], input[id$="_txbAnswer1"]',
    questionSelect: 'select[id$="_ddlQuestions"]',
    submitPhase2: 'input[id$="_Button1"]',

    // Modals
    archivedPanel: 'div[id$="_pnlArchivedRequest"]',
    archivedNoBtn: 'input[id$="_btnCancel"]',
    archivedYesBtn: 'input[id$="_btnRequestSubmit"]',
    submittedPanel: 'div[id$="_pnlSubmittedApp"]',
    submittedViewConfirmRadio: 'input[id$="_radConfirmPage"]',
    submittedNewFromSubmittedRadio: 'input[id$="_radNewFromSubmitted"]',
    submittedContinueBtn: 'input[id$="_btnSubmitedConfirm"]',

    validationSummary: '[id*="ValidationSummary"]',
    errorLabel: '[id*="lblError"]',
} as const;

export const RECOVERY_URL = 'https://ceac.state.gov/GenNIV/Common/Recovery.aspx';
