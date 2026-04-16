# 6 - Address and Phone

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_contact.aspx?node=AddressPhone`

## Overview
This page collects the applicant's home and mailing addresses, phone numbers, email addresses, and social media presence. It combines client-side Javascript toggles for single fields with dynamic list arrays (`DataLists`) that heavily rely on server-side postbacks for data entry.

## Home Address
Collects the primary residence address.
- `tbxAPP_ADDR_LN1`: Street Address (Line 1)
- `tbxAPP_ADDR_LN2`: Street Address (Line 2) *[Optional]*
- `tbxAPP_ADDR_CITY`: City
- `tbxAPP_ADDR_STATE`: State/Province
  - `cbexAPP_ADDR_STATE_NA`: "Does Not Apply" checkbox. (Toggles state field enablement via client-side JS: `enableTbx()`)
- `tbxAPP_ADDR_POSTAL_CD`: Postal Zone/ZIP Code
  - `cbexAPP_ADDR_POSTAL_CD_NA`: "Does Not Apply" checkbox.
- `ddlCountry`: Country/Region

## Mailing Address
- `rblMailingAddrSame`: "Is your Mailing Address the same as your Home Address?" (Radio: Y/N)
  - **Trigger:** The `Y` option triggers a network request `setTimeout('__doPostBack(...)', 0)`. The `N` option acts locally but interacts with `additional-hide-mailingadd1` logic.
  - **State Dependent:** When `N` is selected, the `mailingadd1` panel becomes active.

If `N`, the following fields are processed:
- `tbxMAILING_ADDR_LN1`: Mailing Street Address (Line 1)
- `tbxMAILING_ADDR_LN2`: Mailing Street Address (Line 2) *[Optional]*
- `tbxMAILING_ADDR_CITY`: Mailing City
- `tbxMAILING_ADDR_STATE`: Mailing State/Province
  - `cbexMAILING_ADDR_STATE_NA`: "Does Not Apply"
- `tbxMAILING_ADDR_POSTAL_CD`: Mailing Postal Zone/ZIP Code
  - `cbexMAILING_ADDR_POSTAL_CD_NA`: "Does Not Apply"
- `ddlMailCountry`: Mailing Country/Region

## Phone Numbers
- `tbxAPP_HOME_TEL`: Primary Phone Number.
  - `cbexAPP_HOME_TEL_NA`: "Does Not Apply"
- `tbxAPP_MOBILE_TEL`: Secondary Phone Number.
  - `cbexAPP_MOBILE_TEL_NA`: "Does Not Apply"
- `tbxAPP_BUS_TEL`: Work Phone Number.
  - `cbexAPP_BUS_TEL_NA`: "Does Not Apply"

## Additional Phone Numbers
- `rblAddPhone`: "Have you used any other telephone numbers in the last five years?" (Radio: Y/N)
  - **Trigger:** The `Y` option triggers `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$rblAddPhone$0','')`.
  - **Container:** `upnlAdditionalPhoneAdd`

**DataList Container: `dtlAddPhone`**
- **Array Selector:** `ctl00$SiteContentPlaceHolder$FormView1$dtlAddPhone$ctl[INDEX]$[FIELD]`
- **Fields:**
  - `tbxAddPhoneInfo`: Additional Phone Number
- **Array Controls:**
  - `InsertButtonADDL_PHONE`: Adds a new index row (Postback trigger).
  - `DeleteButtonADDL_PHONE`: Deletes the specific row (Postback trigger).

## Email Addresses
### Primary Email
- `tbxAPP_EMAIL_ADDR`: Primary Email Address

### Additional Emails
- `rblAddEmail`: "Have you used any other email addresses in the last five years?" (Radio: Y/N)
  - **Trigger:** The `N` option triggers `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$rblAddEmail$1','')`. This deletes the sub-form on the CEAC backend.
  - **Container:** `upnlAdditionalEmailAdd`

**DataList Container: `dtlAddEmail`**
- **Array Selector:** `ctl00$SiteContentPlaceHolder$FormView1$dtlAddEmail$ctl[INDEX]$[FIELD]`
- **Fields:**
  - `tbxAddEmailInfo`: Additional Email Address
- **Array Controls:**
  - `InsertButtonADDL_EMAIL`
  - `DeleteButtonADDL_EMAIL`

## Social Media
This section forces the user to declare specific social media platforms used from a predefined standard drop-down list.

**DataList Container: `dtlSocial`**
- **Array Selector:** `ctl00$SiteContentPlaceHolder$FormView1$dtlSocial$ctl[INDEX]$[FIELD]`
- **Fields:**
  - `ddlSocialMedia`: Social Media Provider/Platform (Dropdown). Setting this triggers a `__doPostBack` on change. The value `NONE` corresponds to "None".
  - `tbxSocialMediaIdent`: Social Media Identifier (Text).
- **Array Controls:**
  - `InsertButtonSOCIAL_MEDIA_INFO`
  - `DeleteButtonSOCIAL_MEDIA_INFO`

## Additional Social Media (Other Websites/Apps)
- `rblAddSocial`: "Do you wish to provide information about your presence on any other websites or applications you have used within the last five years...?" (Radio Y/N).
  - **Trigger:** The `N` option triggers `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$rblAddSocial$1','')`.
  - **Container:** `upnlAdditionalSocialAdd`

**DataList Container: `dtlAddSocial`**
- **Array Selector:** `ctl00$SiteContentPlaceHolder$FormView1$dtlAddSocial$ctl[INDEX]$[FIELD]`
- **Fields:**
  - `tbxAddSocialPlat`: Additional Social Media Platform (Text input, unlike the primary social media dropdown).
  - `tbxAddSocialHand`: Additional Social Media Handle.
- **Array Controls:**
  - `InsertButtonADDL_SOCIAL_MEDIA`
  - `DeleteButtonADDL_SOCIAL_MEDIA`

## Performance & Scripting Considerations
1. **Four Concurrent DataLists:** This page is particularly heavy as it manages four distinct dynamic array sub-forms (`dtlAddPhone`, `dtlAddEmail`, `dtlSocial`, `dtlAddSocial`). A frontend clone must supply these uniformly within the payload, and the automation engine must track current indexes for each isolated list separately to avoid mismatch exceptions during postbacks.
2. **`cbex` Checkboxes vs `rbl` Radios:** Unlike radio button questions which almost always send network postbacks here, the "Does Not Apply" indicators (`cbex` prefixed elements attached to phones and states) use a local JavaScript function `enableTbx` that merely disables the corresponding text inputs instantly without causing page hydration waiting states.
3. **Dropdown Postback on Social Media:** The `ddlSocialMedia` triggers a postback when selected. The engine MUST enforce a `waitForPostbackTriggeredBy` rule after changing this dropdown to prevent a race condition before filling the `tbxSocialMediaIdent` field.
