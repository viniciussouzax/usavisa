// Landing (Default.aspx) selectors — direct facts about the CEAC DOM.

export const APPLY_SELECTORS = {
    locationSelect: 'select[id$="_ddlLocation"]',
    captchaImage: [
        'img[id$="c_default_ctl00_sitecontentplaceholder_uclocation_identifycaptcha1_defaultcaptcha"]',
        'img[id$="_CaptchaImage"]',
        'img[src*="captcha"]',
    ] as string[],
    captchaInput: [
        'input[id$="_ucLocation_IdentifyCaptcha1_txtCodeTextBox"]',
        'input[id$="_txtCodeTextBox"]',
    ] as string[],
    startLink: 'a[id$="_lnkNew"]',
    retrieveLink: 'a[id$="_lnkRetrieve"]',

    // Retrieve flow — only rendered when lnkRetrieve was clicked
    retrieveApplicationId: 'input[id$="_tbxApplicationID"]',
    retrieveMonth: 'select[id$="_ddlMonth"]',
    retrieveDay: 'select[id$="_ddlDay"]',
    retrieveYear: 'input[id$="_txtYear"], input[id$="_tbxYear"]',
    retrieveAnswer: 'input[id$="_txtAnswer"]',
    retrieveSurname: 'input[id$="_txbSurname"]',
    retrieveDobYear: 'input[id$="_txbDOBYear"]',

    // Post-selection modals
    postMessagePanel: 'div[id$="_ucPostMessage_ucPost_pnlMessage"]',
    postMessageClose: 'a[id$="_ucPostMessage_ucPost_ctl01_lnkClose"]',
    browserReqPanel: 'div[id$="_ucBrowserReqs_pnlMessage"]',
    browserReqClose: 'a[id$="_ucBrowserReqs_ctl01_lnkClose"]',

    validationSummary: '[id*="ValidationSummary"]',
} as const;

export const APPLY_URL = 'https://ceac.state.gov/GenNIV/Default.aspx';
