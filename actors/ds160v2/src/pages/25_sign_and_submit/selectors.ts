// Sign & Submit selectors — facts from spec/actors/ceac_ds160/pages/25_sign_and_submit.md.

export const SIGN_SELECTORS = {
    // Step 1 — Preparer question
    preparerYes: 'input[id$="_rblPREP_IND_0"]',
    preparerNo: 'input[id$="_rblPREP_IND_1"]',

    // Step 2 — E-signature inputs
    passportInput: 'input[id$="_PPTNumTbx"]',
    captchaInput: 'input[id$="_CodeTextBox"]',
    captchaImage: [
        'img[id$="_CaptchaImage"]',
        'img[src*="BotDetectCaptcha.ashx"]',
        'img[src*="captcha"]',
    ] as string[],

    // Step 3 — Final submit
    signAppButton: 'input[id$="_btnSignApp"]',

    // Step 4 — Post-signature transition
    nextConfirmation: 'input[id$="_UpdateButton3"]',
    successPanel: 'div[id$="_Hide_Show3"]',

    // Validation
    validationSummary: 'div[id$="_ValidationSummary1"], [id*="ValidationSummary"]',
} as const;

export const SIGN_URL = 'https://ceac.state.gov/GenNIV/General/esign/signtheapplication.aspx';
