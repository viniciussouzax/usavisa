# Passport Information (`7 - Passport`)

## Overview
Maps the Passport and Travel Document section of the DS-160 form. This section contains several critical server-side validations depending on the passport type selected, expiration date conditions, and whether a past passport was lost or stolen.

## Navigation Context
- **Previous Page**: [Address and Phone](./09_address_and_phone.md) (`ctl00$SiteContentPlaceHolder$UpdateButton1`)
- **Next Page**: U.S. Contact (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors & Identifiers
All selectors are prefixed with `ctl00_SiteContentPlaceHolder_FormView1_`.

### Passport Information
- **Passport/Travel Document Type**: 
  - ID: `ddlPPT_TYPE`
  - Control: `<select>`
  - Action/Trigger: `__doPostBack` on change.
  - Options:
    - R = REGULAR
    - O = OFFICIAL
    - D = DIPLOMATIC
    - L = LAISSEZ-PASSER
    - T = OTHER
  - **Conditional Logic**: If "OTHER" is selected, the `passportOther` section is spawned.

- **Explain Other Passport Type** (Conditional):
  - Container ID: `passportOther`
  - Field ID: `tbxPptOtherExpl`
  - Control: `<textarea>` (Max 4000 chars)

- **Passport/Travel Document Number**:
  - ID: `tbxPPT_NUM`
  - Control: `<input type="text">`

- **Passport Book Number**:
  - ID: `tbxPPT_BOOK_NUM`
  - Control: `<input type="text">`
  - Does Not Apply ID: `cbexPPT_BOOK_NUM_NA`
  - Control: `<input type="checkbox">`
  - Action/Trigger: Local JS `enableTbx()`. No Postback required.

- **Country/Authority that Issued Passport**:
  - ID: `ddlPPT_ISSUED_CNTRY`
  - Control: `<select>`
  - *Note*: If the user selects a country different from their Nationality, a modal warning may appear (`modalNationalityWarning_backgroundElement`) asking them to confirm the change via `ctl00_SiteContentPlaceHolder_btnChangeNationality` ("Save and Continue").

- **Where was the Passport/Travel Document Issued?**:
  - City ID: `tbxPPT_ISSUED_IN_CITY` (Max 25 chars)
  - State/Province ID: `tbxPPT_ISSUED_IN_STATE` (Max 25 chars)
  - Country/Region ID: `ddlPPT_ISSUED_IN_CNTRY`

- **Issuance Date**:
  - Day ID: `ddlPPT_ISSUED_DTEDay`
  - Month ID: `ddlPPT_ISSUED_DTEMonth`
  - Year ID: `tbxPPT_ISSUEDYear`

- **Expiration Date**:
  - Day ID: `ddlPPT_EXPIRE_DTEDay`
  - Month ID: `ddlPPT_EXPIRE_DTEMonth`
  - Year ID: `tbxPPT_EXPIREYear`
  - No Expiration ID: `cbxPPT_EXPIRE_NA`
  - Action/Trigger: `__doPostBack` when toggled.

---

### Lost/Stolen Passport
- **Have you ever lost a passport or had one stolen?**:
  - Radio Name: `rblLOST_PPT_IND`
  - ID (Yes): `rblLOST_PPT_IND_0` (Value: `Y`)
  - ID (No): `rblLOST_PPT_IND_1` (Value: `N`)
  - Action/Trigger (No): Selecting "No" triggers `__doPostBack`.

#### Lost/Stolen Details (DataList: `dtlLostPPT`)
Appears if `rblLOST_PPT_IND` = Y.
*Note: Uses `[INDEX]` starting from `ctl00` for `dtlLostPPT_ctl00`...* 

- **Passport/Travel Document Number**:
  - ID: `dtlLostPPT_[INDEX]_tbxLOST_PPT_NUM`
  - Control: `<input type="text">`
  - Do Not Know ID: `dtlLostPPT_[INDEX]_cbxLOST_PPT_NUM_UNKN_IND`
  - Control: `<input type="checkbox">`
  - Action/Trigger: `__doPostBack` when toggled.

- **Country/Authority that Issued Passport**:
  - ID: `dtlLostPPT_[INDEX]_ddlLOST_PPT_NATL`
  - Control: `<select>`

- **Explain**:
  - ID: `dtlLostPPT_[INDEX]_tbxLOST_PPT_EXPL`
  - Control: `<textarea>` (Max 4000 chars)

- **Array Controls**:
  - Add Another: `dtlLostPPT_[INDEX]_InsertButtonLostPPT`
  - Remove: `dtlLostPPT_[INDEX]_DeleteButtonLostPPT`
  - Action/Trigger: Standard `__doPostBack` for adding or removing list items.

## Automation Constraints & Implementation Notes
1. **Dependent Validations (Passport Type)**: Checking "OTHER" in `ddlPPT_TYPE` requires waiting for network hydration, as the `tbxPptOtherExpl` field renders server-side.
2. **Expiration Rules**: `cbxPPT_EXPIRE_NA` has a postback. When true, day/month/year dropdowns/inputs will be locked or omitted by the server. Ensure the automation script waits for hydration before proceeding.
3. **Array Structure `dtlLostPPT`**: Employs the `[INDEX]` architecture using ASP.NET DataList numbering (`ctl00`, `ctl01`).
4. **Modals/Popups**: Be prepared for the Nationality Warning Modal (`modalNationalityWarning_backgroundElement`). The engine must detect its display status and click `btnChangeNationality` to proceed safely if triggered.
