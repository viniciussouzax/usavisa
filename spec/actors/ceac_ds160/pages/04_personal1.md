# Personal 1

### Overview
URL: `https://ceac.state.gov/GenNIV/General/complete/complete_personal.aspx?node=Personal1`
Captures fundamental civil identities including principal name, native name, aliases (DataList), telecode, demographic data, and birth location.

### Core Fields

#### Name Validation
- **Surnames**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME`
  - Validation: Max Length 33
  - Context: Required. Maps to "Surnames". 
- **Given Names**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_GIVEN_NAME`
  - Validation: Max Length 33
  - Context: Required. For individuals with no given name, CEAC requires the input "FNU" (First Name Unknown).
- **Full Name in Native Alphabet**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_FULL_NAME_NATIVE`
  - Validation: Max Length 100
  - Dependency Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_FULL_NAME_NATIVE_NA` (Does Not Apply/Technology Not Available) -> Triggers client-side JS (`enableTbx`), NO postback.

#### Other Names / Aliases
- **Other Names Question**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblOtherNames_0` (Value: `Y`, No Postback)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblOtherNames_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$rblOtherNames$1\',\'\')', 0)`)
  - *Context:* Selecting "No" drops the alias form. Selecting "Yes" opens the Alias `DataList`.
- **Alias DataList** (`ctl00_SiteContentPlaceHolder_FormView1_DListAlias`)
  - Surname: `ctl00_SiteContentPlaceHolder_FormView1_DListAlias_ctl[INDEX]_tbxSURNAME` (Max Length: 33)
  - Given Name: `ctl00_SiteContentPlaceHolder_FormView1_DListAlias_ctl[INDEX]_tbxGIVEN_NAME` (Max Length: 33)
  - Add Another: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$DListAlias$ctl[INDEX]$InsertButtonAlias','')`
  - Remove: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$DListAlias$ctl[INDEX]$DeleteButtonAlias','')`

#### Telecode
- **Telecode Question**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblTelecodeQuestion_0` (Value: `Y`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblTelecodeQuestion_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
  - *Context:* If "Yes", presents Telecode entry fields.
  - **Telecode Given Name:** `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_TelecodeGIVEN_NAME` (Max Length: 20)
  - **Telecode Surname:** `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_TelecodeSURNAME` (Max Length: 20)

#### Demographics
- **Sex**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_GENDER`
  - Options: `M` (Male), `F` (Female)
- **Marital Status**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_MARITAL_STATUS`
  - Postback: Triggers `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$ddlAPP_MARITAL_STATUS\',\'\')', 0)` upon change.
  - Options: 
    - `M` (Married)
    - `C` (Common Law Marriage)
    - `P` (Civil Union/Domestic Partnership)
    - `S` (Single)
    - `W` (Widowed)
    - `D` (Divorced)
    - `L` (Legally Separated)
    - `O` (Other)
  - **Other Marital Status Details**
    - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxOtherMaritalStatus`
    - Context: Required and visible only if Marital Status = `O` (Other). Max Length 200.
  - *Architectural Note:* This dropdown state dictates the subsequent inclusion of Spouse, Previous Spouse, and Deceased Spouse pages in the workflow routing.

#### Date and Place of Birth
- **Date of Birth**
  - Day: `ctl00_SiteContentPlaceHolder_FormView1_ddlDOBDay` (Select `01` - `31`)
  - Month: `ctl00_SiteContentPlaceHolder_FormView1_ddlDOBMonth` (Select `JAN` - `DEC`)
  - Year: `ctl00_SiteContentPlaceHolder_FormView1_tbxDOBYear` (Max Length: 4)
- **Place of Birth**
  - City: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_CITY` (Max Length: 20)
  - State/Province: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_POB_ST_PROVINCE` (Max Length: 20)
  - State/Province NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_POB_ST_PROVINCE_NA`
  - Country/Region: `ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_POB_CNTRY`

### Navigation
- **Back**: `ctl00_SiteContentPlaceHolder_UpdateButton1` (Getting Started)
- **Save**: `ctl00_SiteContentPlaceHolder_UpdateButton2`
- **Next**: `ctl00_SiteContentPlaceHolder_UpdateButton3` (Personal 2)
