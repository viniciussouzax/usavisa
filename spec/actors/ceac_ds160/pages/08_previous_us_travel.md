# Previous U.S. Travel

**Path/URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_previousustravel.aspx?node=PreviousUSTravel`

## Overview
This section captures the applicant's prior history with the United States, including previous visits, visas issued, ESTA denials, and immigrant petitions. The page features heavy use of conditional rendering based on radio button selections, with multiple dynamic `DataList` sections for arrays of data (Previous Visits and Driver's Licenses).

---

## 1. Previous U.S. Visits
**Primary Trigger:** `Have you ever been in the U.S.?`
- **Control:** RadioButton (`rblPREV_US_TRAVEL_IND_0` = Y | `rblPREV_US_TRAVEL_IND_1` = N)
- **Postback:** `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$rblPREV_US_TRAVEL_IND$1','')`

### State: IF YES (Y) -> Renders "Previous Visits DataList" and "Driver's License Section"

#### A. Previous Visits DataList
Captures up to the last 5 visits to the U.S.
- **Container ID:** `dtlPREV_US_VISIT`
- **Pattern:** `ctl00$SiteContentPlaceHolder$FormView1$dtlPREV_US_VISIT$ctl[INDEX]$[FIELD_ID]`

| Label | Control ID | Type | Validation/Rules |
| :--- | :--- | :--- | :--- |
| Date Arrived (Day) | `ddlPREV_US_VISIT_DTEDay` | Dropdown | `1` to `31` |
| Date Arrived (Month) | `ddlPREV_US_VISIT_DTEMonth` | Dropdown | `1` to `12` |
| Date Arrived (Year) | `tbxPREV_US_VISIT_DTEYear` | TextBox | MaxLength: 4 (YYYY) |
| Length of Stay | `tbxPREV_US_VISIT_LOS` | TextBox | MaxLength: 3 |
| Length of Stay Unit | `ddlPREV_US_VISIT_LOS_CD` | Dropdown | `Y`, `M`, `W`, `D`, `H` (Years, Months, Weeks, Days, Less Than 24 Hours) |

**Array Actions (Postback Dependencies):**
- **Add Another:** `InsertButtonPREV_US_VISIT`
- **Remove:** `DeleteButtonPREV_US_VISIT`

#### B. U.S. Driver's License
**Secondary Trigger:** `Do you or did you ever hold a U.S. Driver’s License?`
- **Control:** RadioButton (`rblPREV_US_DRIVER_LIC_IND`)
- **Postback:** Triggered on selection 'N' (`__doPostBack('ctl00$...$rblPREV_US_DRIVER_LIC_IND$1','')`)

### State: IF YES (Y) TO DRIVER'S LICENSE -> Renders "Licenses DataList"
- **Container ID:** `dtlUS_DRIVER_LICENSE`
- **Pattern:** `ctl00$SiteContentPlaceHolder$FormView1$dtlUS_DRIVER_LICENSE$ctl[INDEX]$[FIELD_ID]`

| Label | Control ID | Type | Validation/Rules |
| :--- | :--- | :--- | :--- |
| Driver's License Number | `tbxUS_DRIVER_LICENSE` | TextBox | MaxLength: 20 |
| Do Not Know (Checkbox) | `cbxUS_DRIVER_LICENSE_NA` | Checkbox | Disables text tracking if checked |
| State of Driver's License | `ddlUS_DRIVER_LICENSE_STATE` | Dropdown | Standard U.S. States Codes (e.g. `AL`, `CA`, `NY`) |

**Array Actions (Postback Dependencies):**
- **Add Another:** `InsertButtonUS_DRIVER_LICENSE`
- **Remove:** `DeleteButtonUS_DRIVER_LICENSE`

---

## 2. Previous U.S. Visas
**Primary Trigger:** `Have you ever been issued a U.S. Visa?`
- **Control:** RadioButton (`rblPREV_VISA_IND`)
- **Postback:** Triggered on selection 'N'

### State: IF YES (Y) -> Renders Form Block (Not a DataList)
This is a standard flat field group (no Add Another).

| Label | Control ID | Type | Validation/Rules |
| :--- | :--- | :--- | :--- |
| Date Last Visa Issued (Day) | `ddlPREV_VISA_ISSUED_DTEDay` | Dropdown | `1` to `31` |
| Date Last Visa Issued (Mon) | `ddlPREV_VISA_ISSUED_DTEMonth` | Dropdown | `1` to `12` |
| Date Last Visa Issued (Year) | `tbxPREV_VISA_ISSUED_DTEYear` | TextBox | MaxLength: 4 (YYYY) |
| Visa Number | `tbxPREV_VISA_FOIL_NUMBER` | TextBox | MaxLength: 12 (Found in red on foil). NA checkbox available `cbxPREV_VISA_FOIL_NUMBER_NA` |
| Apply for Same Type? | `rblPREV_VISA_SAME_TYPE_IND` | RadioButton | `Y` / `N` |
| Apply in Same Country? | `rblPREV_VISA_SAME_CNTRY_IND` | RadioButton | `Y` / `N` |
| Have you been ten-printed? | `rblPREV_VISA_TEN_PRINT_IND` | RadioButton | `Y` / `N` |

#### Conditional: Lost/Stolen Visa
**Trigger:** `Has your U.S. Visa ever been lost or stolen?` (`rblPREV_VISA_LOST_IND`) -> IF **Y** renders:
- **Year:** `tbxPREV_VISA_LOST_YEAR` (TextBox, MaxLength: 4)
- **Explain:** `tbxPREV_VISA_LOST_EXPL` (TextArea, MaxLength: 4000)

#### Conditional: Cancelled/Revoked Visa
**Trigger:** `Has your U.S. Visa ever been cancelled or revoked?` (`rblPREV_VISA_CANCELLED_IND`) -> IF **Y** renders:
- **Explain:** `tbxPREV_VISA_CANCELLED_EXPL` (TextArea, MaxLength: 4000)

#### Conditional: Refused Visa
**Trigger:** `Have you ever been refused a U.S. Visa, or been refused admission to the United States, or withdrawn your application for admission at the port of entry?` (`rblPREV_VISA_REFUSED_IND`) -> IF **Y** renders:
- **Explain:** `tbxPREV_VISA_REFUSED_EXPL` (TextArea, MaxLength: 4000)

---

## 3. ESTA / VWP Denial
**Primary Trigger:** `Have you ever been denied travel authorization by the Department of Homeland Security through the Electronic System for Travel Authorization (ESTA)?`
- **Control:** RadioButton (`rblVWP_DENIAL_IND`)
- **Postback:** Triggered on selection 'N'

### State: IF YES (Y)
- **Explain:** Renders `tbxVWP_DENIAL_EXPL` (TextArea, MaxLength: 4000)

---

## 4. Immigrant Petition
**Primary Trigger:** `Has anyone ever filed an immigrant petition on your behalf with the United States Citizenship and Immigration Services?`
- **Control:** RadioButton (`rblIV_PETITION_IND`)
- **Postback:** Triggered on selection 'N'

### State: IF YES (Y)
- **Explain:** Renders `tbxIV_PETITION_EXPL` (TextArea, MaxLength: 4000)

---

## 5. Global Action Buttons
- `BackButton` (Back: Travel Companions) -> `UPDATE BUTTON 1` (`ctl00$SiteContentPlaceHolder$UpdateButton1`)
- `SaveButton` (Save) -> `UPDATE BUTTON 2` (`ctl00$SiteContentPlaceHolder$UpdateButton2`)
- `NextButton` (Next: Address & Phone) -> `UPDATE BUTTON 3` (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
