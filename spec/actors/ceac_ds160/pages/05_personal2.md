# Personal 2

### Overview
URL: `https://ceac.state.gov/GenNIV/General/complete/complete_personalcont.aspx?node=Personal2`
Captures nationality, alternative nationalities/passports, permanent residency information, and official identification numbers (National ID, U.S. SSN, and U.S. Tax ID).

### Core Fields

#### Nationality
- **Primary Nationality**
  - Dropdown ID: `ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_NATL`
  - Postback: Triggers `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$ddlAPP_NATL\',\'\')', 0)` upon change.
  - *Context:* Crucial for resetting internal CEAC rules based on country of origin.

#### Other Nationalities
- **Other Nationality Indicator**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTH_NATL_IND_0` (Value: `Y`, No Postback)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblAPP_OTH_NATL_IND_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
- **Other Nationality DataList/Repeater** (`ctl00_SiteContentPlaceHolder_FormView1_dtlOTHER_NATL`)
  - Country Dropdown: `ctl00_SiteContentPlaceHolder_FormView1_dtlOTHER_NATL_ctl[INDEX]_ddlOTHER_NATL`
  - **Hold Passport for other Country Question:**
    - Yes: `ctl00_SiteContentPlaceHolder_FormView1_dtlOTHER_NATL_ctl[INDEX]_rblOTHER_PPT_IND_0` (Value: `Y`, No Postback)
    - No: `ctl00_SiteContentPlaceHolder_FormView1_dtlOTHER_NATL_ctl[INDEX]_rblOTHER_PPT_IND_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
  - Passport Number (if Yes to above): `ctl00_SiteContentPlaceHolder_FormView1_dtlOTHER_NATL_ctl[INDEX]_tbxOTHER_PPT_NUM` (Max Length: 20)
  - Add Another: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlOTHER_NATL$ctl[INDEX]$InsertButtonOTHER_NATL','')`
  - Remove: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlOTHER_NATL$ctl[INDEX]$DeleteButtonOTHER_PPT','')`

#### Permanent Residency
- **Other Permanent Resident Indicator**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblPermResOtherCntryInd_0` (Value: `Y`, No Postback)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblPermResOtherCntryInd_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
- **Other Permanent Resident DataList/Repeater** (`ctl00_SiteContentPlaceHolder_FormView1_dtlOthPermResCntry`)
  - Country Dropdown: `ctl00_SiteContentPlaceHolder_FormView1_dtlOthPermResCntry_ctl[INDEX]_ddlOthPermResCntry`
  - Add Another: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlOthPermResCntry$ctl[INDEX]$InsertButtonOTHER_PERM_RES','')`
  - Remove: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlOthPermResCntry$ctl[INDEX]$DeleteButtonOTHER_PERM_RES','')`

#### Identification Numbers
- **National Identification Number**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_NATIONAL_ID` (Max Length: 20)
  - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_NATIONAL_ID_NA` -> Triggers client-side JS (`enableTbx`), NO postback.
- **U.S. Social Security Number**
  - ID1 (First 3): `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SSN1`
  - ID2 (Middle 2): `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SSN2`
  - ID3 (Last 4): `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SSN3`
  - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_SSN_NA` -> Triggers client-side JS (`enableTbx3`), NO postback.
- **U.S. Taxpayer ID Number**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_TAX_ID` (Max Length: 20)
  - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbexAPP_TAX_ID_NA` -> Triggers client-side JS (`enableTbx`), NO postback.

### Navigation
- **Back**: `ctl00_SiteContentPlaceHolder_UpdateButton1` (Personal 1)
- **Save**: `ctl00_SiteContentPlaceHolder_UpdateButton2`
- **Next**: `ctl00_SiteContentPlaceHolder_UpdateButton3` (Travel)
