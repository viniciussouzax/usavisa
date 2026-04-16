# Travel Companions

### Overview
URL: `https://ceac.state.gov/GenNIV/General/complete/complete_travelcompanions.aspx?node=TravelCompanions`
Captures information about other individuals or groups traveling with the principal applicant. This page heavily uses `__doPostBack` to show either a generic group name field or a detailed DataList of individual companions.

### Main State: Traveling with Others
- **Are there other persons traveling with you?**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblOtherPersonsTravelingWithYou_0` (Value: `Y`, No Postback)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblOtherPersonsTravelingWithYou_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$rblOtherPersonsTravelingWithYou$1\',\'\')', 0)`)
  - *Context:* Selecting "Yes" opens the secondary question about Group Travel. Selecting "No" hides all subsequent sections.

### Secondary State: Group or Individual
*(Visible only if `rblOtherPersonsTravelingWithYou` is `Y`)*
- **Are you traveling as part of a group or organization?**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblGroupTravel_0` (Value: `Y`, Triggers Postback: `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$rblGroupTravel$0\',\'\')', 0)`)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblGroupTravel_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$FormView1$rblGroupTravel$1\',\'\')', 0)`)
  - *Context:* Selecting "Yes" requests just the group name. Selecting "No" renders the individual companions DataList.

### Conditional: Group Travel (Yes)
- **Enter the name of the group you are traveling with**
  - Group Name: `ctl00_SiteContentPlaceHolder_FormView1_tbxGroupName` (Max Length: 75)

### Conditional: Individual Companions DataList (No)
- Container: `ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions`
- **Surnames of Person Traveling With You**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl[INDEX]_tbxTC_SURNAME` (Max Length: 33)
- **Given Names of Person Traveling With You**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl[INDEX]_tbxTC_GIVEN_NAME` (Max Length: 33)
- **Relationship with Person**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_dlTravelCompanions_ctl[INDEX]_ddlTCRelationship`
  - Options:
    - `P` (PARENT)
    - `S` (SPOUSE)
    - `C` (CHILD)
    - `R` (OTHER RELATIVE)
    - `F` (FRIEND)
    - `B` (BUSINESS ASSOCIATE)
    - `O` (OTHER)

- **Add Another Companion**
  - Trigger: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dlTravelCompanions$ctl[INDEX]$InsertButtonPrincipalPOT','')`
- **Remove Companion**
  - Trigger: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dlTravelCompanions$ctl[INDEX]$DeleteButtonPrincipalPOT','')`

### Navigation
- **Back**: `ctl00_SiteContentPlaceHolder_UpdateButton1` (Travel)
- **Save**: `ctl00_SiteContentPlaceHolder_UpdateButton2`
- **Next**: `ctl00_SiteContentPlaceHolder_UpdateButton3` (Previous U.S. Travel)
