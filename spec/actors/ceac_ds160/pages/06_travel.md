# Travel

### Overview
URL: `https://ceac.state.gov/GenNIV/General/complete/complete_travel.aspx?node=Travel1`
Captures the principal applicant's travel plans to the U.S., including purpose of trip, specific travel itineraries (flight and city details), and the entity paying for the trip. The page highly depends on server-side postbacks to conditionally render subsections.

### Main State: Specific Travel Plans
- **Have you made specific travel plans?**
  - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblSpecificTravel_0` (Value: `Y`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
  - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblSpecificTravel_1` (Value: `N`, Triggers Postback: `setTimeout('__doPostBack(...)', 0)`)
  - *Context:* This is the primary state toggle for the page. Selecting "Yes" renders the itinerary structure; "No" renders the generic estimation fields. It is critical that the automation engine triggers this immediately to ensure DOM readiness.

### State: No Specific Travel Plans (N)
- **Intended Date of Arrival**
  - Day: `ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_NSDTEDay`
  - Month: `ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_NSDTEMonth`
  - Year: `ctl00_SiteContentPlaceHolder_FormView1_tbxARRIVAL_US_NSDTEYear`
- **Intended Length of Stay in U.S.**
  - Length Number: `ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_LOS` (Max Length: 3)
  - Period Dropdown (Days, Weeks, Months, Years): `ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_LOS_CD`

### State: Specific Travel Plans (Y)
- **Date of Arrival in U.S.**
  - Day: `ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEDay`
  - Month: `ctl00_SiteContentPlaceHolder_FormView1_ddlARRIVAL_US_DTEMonth`
  - Year: `ctl00_SiteContentPlaceHolder_FormView1_tbxARRIVAL_US_DTEYear`
- **Arrival Flight (if known)**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxArriveFlight` (Max Length: 20)
- **Arrival City**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxArriveCity` (Max Length: 20)

- **Date of Departure from U.S.**
  - Day: `ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEDay`
  - Month: `ctl00_SiteContentPlaceHolder_FormView1_ddlDEPARTURE_US_DTEMonth`
  - Year: `ctl00_SiteContentPlaceHolder_FormView1_tbxDEPARTURE_US_DTEYear`
- **Departure Flight (if known)**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxDepartFlight` (Max Length: 20)
- **Departure City**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxDepartCity` (Max Length: 20)

- **Locations you plan to visit in the U.S. (DataList)**
  - Container: `ctl00_SiteContentPlaceHolder_FormView1_dtlTravelLoc`
  - Location Name: `ctl00_SiteContentPlaceHolder_FormView1_dtlTravelLoc_ctl[INDEX]_tbxSPECTRAVEL_LOCATION` (Max Length: 40)
  - Add Another: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlTravelLoc$ctl[INDEX]$InsertButtonTravelLoc','')`
  - Remove: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dtlTravelLoc$ctl[INDEX]$DeleteButtonTravelLoc','')`

### Section: Purpose of Trip to the U.S.
- **Purpose of Trip (Visa Class)**
  - Container: `ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel`
  - Dropdown ID: `ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl[INDEX]_ddlPurposeOfTrip`
  - Postback: Triggers `setTimeout('__doPostBack(...)', 0)` to render specific visa subclasses.
  - *Architectural Note:* This field dictates the global navigation tree of the DS-160 application (e.g., branching out into Student/Exchange, Crew Member, or Temp Work Visa pages). The automation engine MUST guarantee synchronization after this postback before proceeding, as the page graph will dynamically shift.
- **Specify (Subclass)**
  - Dropdown ID: `ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl[INDEX]_ddlOtherPurpose`
  - Postback: Triggers `setTimeout('__doPostBack(...)', 0)` upon selection.

#### Conditional: Purpose of Trip Dependencies (e.g., F1/F2, J1/J2)
- For dependent subclasses (like F2, J2), "Principal Applicant Information" is requested within the repeater block:
  - Surnames: `ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl[INDEX]_tbxPrincipleAppSurname` (Max Length: 33)
  - Given Names: `ctl00_SiteContentPlaceHolder_FormView1_dlPrincipalAppTravel_ctl[INDEX]_tbxPrincipleAppGivenName` (Max Length: 33)

- **Add Another Purpose**: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dlPrincipalAppTravel$ctl[INDEX]$InsertButtonAlias','')`
- **Remove Purpose**: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$dlPrincipalAppTravel$ctl[INDEX]$DeleteButtonAlias','')`

### Section: Address Where You Will Stay in the U.S.
- Street Address 1: `ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress1` (Max Length: 40)
- Street Address 2: `ctl00_SiteContentPlaceHolder_FormView1_tbxStreetAddress2` (Max Length: 40, Optional)
- City: `ctl00_SiteContentPlaceHolder_FormView1_tbxCity` (Max Length: 20)
- State: `ctl00_SiteContentPlaceHolder_FormView1_ddlTravelState`
- ZIP Code: `ctl00_SiteContentPlaceHolder_FormView1_tbZIPCode` (Max Length: 9)

### Section: Person/Entity Paying for Your Trip
- **Paying Entity Dropdown**
  - ID: `ctl00_SiteContentPlaceHolder_FormView1_ddlWhoIsPaying`
  - Values: `S` (Self), `O` (Other Person), `P` (Present Employer), `U` (Employer in the U.S.), `C` (Other Company/Organization)
  - Postback: Triggers `setTimeout('__doPostBack(...)', 0)` to request entity details based on selection.

#### Conditional: Paying Entity Details (If Other Person / Organization)
- *If Company/Organization (C) or Employer (P/U):*
  - Name of Company/Org: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayingCompany` (Max Length: 33)
  - Telephone: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerPhone` (Max Length: 15)
  - Relationship to You: `ctl00_SiteContentPlaceHolder_FormView1_tbxCompanyRelation`
- *If Other Person (O):*
  - Surnames: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerSurname` (Max Length: 33)
  - Given Names: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerGivenName` (Max Length: 33)
  - Telephone: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerPhone` (Max Length: 15)
  - Email: `ctl00_SiteContentPlaceHolder_FormView1_tbxPAYER_EMAIL_ADDR` (Max Length: 50)
    - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbxDNAPAYER_EMAIL_ADDR_NA` (Triggers Server Postback)
  - Relationship to You: `ctl00_SiteContentPlaceHolder_FormView1_ddlPayerRelationship`
  - Same Address as You: 
    - Radio Yes: `ctl00_SiteContentPlaceHolder_FormView1_rblPayerAddrSameAsInd_0` (Triggers Server Postback)
    - Radio No: `ctl00_SiteContentPlaceHolder_FormView1_rblPayerAddrSameAsInd_1` (No postback)

- **Paying Entity Address (Shown if NOT Self, and NOT same address as App)**
  - Street Address 1: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerStreetAddress1` (Max Length: 40)
  - Street Address 2: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerStreetAddress2` (Max Length: 40)
  - City: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerCity` (Max Length: 20)
  - State/Province: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerStateProvince` (Max Length: 20)
    - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbxDNAPayerStateProvince` (Triggers Server Postback)
  - Postal Zone/ZIP: `ctl00_SiteContentPlaceHolder_FormView1_tbxPayerPostalZIPCode` (Max Length: 10)
    - NA Checkbox: `ctl00_SiteContentPlaceHolder_FormView1_cbxDNAPayerPostalZIPCode` (Triggers Server Postback)
  - Country/Region: `ctl00_SiteContentPlaceHolder_FormView1_ddlPayerCountry`

### Navigation
- **Back**: `ctl00_SiteContentPlaceHolder_UpdateButton1` (Personal 2)
- **Save**: `ctl00_SiteContentPlaceHolder_UpdateButton2`
- **Next**: `ctl00_SiteContentPlaceHolder_UpdateButton3` (Travel Companions)

---

## Comportamentos Críticos para a Engine

### BC-1: ⚠️ EXCEÇÃO — Formato de Data na Travel Page (Sem Zero-Padding)
Esta página é uma **exceção documentada** à convenção geral de datas do DS-160.

Os selects de data na Travel page usam valores numéricos **sem zero-padding e sem abreviações**:
- Meses: `'1'` a `'12'` (não `'01'`, não `'JAN'`)
- Dias: `'1'` a `'31'` (não `'01'`)

A engine deve converter o valor do payload antes de tentar `selectOption()` nessa página, removendo zeros à esquerda e convertendo abreviações de mês (ex: `'JAN'` → `'1'`).

### BC-2: Sequência Obrigatória de Postbacks (Ordem Estrita)
A Travel page exige que os postbacks ocorram nesta ordem exata, pois cada um pode revelar ou ocultar campos que dependem do anterior:

1. `ddlPurposeOfTrip` → postback (define classe de visto)
2. `ddlOtherPurpose` → postback (define subclasse)
3. `rblSpecificTravel` (Yes/No) → postback (bifurca a estrutura da página)
4. `ddlTRAVEL_LOS_CD` → postback (apenas no Path B)
5. `ddlWhoIsPaying` → postback (revela campos do pagador)
6. `rblPayerAddrSameAsInd` → postback (apenas se pagador = Other Person)
7. `cbxDNAPAYER_EMAIL_ADDR_NA` → postback (apenas se email do pagador é nulo)

Cada postback na lista acima encerra a passa atual e exige rescan conforme §10.1 do `engine_rules.md`.

### BC-3: Bifurcação "Specific Travel Plans" — Dois Conjuntos de Campos

**Path A (Yes — Planos Específicos):**

| Campo | ID Suffix | Notas |
|---|---|---|
| Arrival Day | `ddlARRIVAL_US_DTEDay` | Sem zero-padding |
| Arrival Month | `ddlARRIVAL_US_DTEMonth` | Sem zero-padding |
| Arrival Year | `tbxARRIVAL_US_DTEYear` | Texto |
| Departure Day | `ddlDEPARTURE_US_DTEDay` | Sem zero-padding |
| Departure Month | `ddlDEPARTURE_US_DTEMonth` | Sem zero-padding |
| Departure Year | `tbxDEPARTURE_US_DTEYear` | Texto |
| Arrival Flight | `tbxArriveFlight` | Opcional |
| Arrival City | `tbxArriveCity` | Opcional |
| Departure Flight | `tbxDepartFlight` | Opcional |
| Departure City | `tbxDepartCity` | Opcional |
| 1ª localização | `tbxSPECTRAVEL_LOCATION` | Campo direto (não DataList) |
| Localizações adicionais | `dtlTravelLoc_ctl{nn}_tbxSPECTRAVEL_LOCATION` | DataList |

**Path B (No — Sem Planos Específicos):**

| Campo | ID Suffix | Notas |
|---|---|---|
| Arrival Day | `ddlTRAVEL_DTEDay` | Sem zero-padding |
| Arrival Month | `ddlTRAVEL_DTEMonth` | Sem zero-padding |
| Arrival Year | `tbxTRAVEL_DTEYear` | Texto |
| Length of Stay (valor) | `tbxTRAVEL_LOS` | Numérico |
| Length of Stay (unidade) | `ddlTRAVEL_LOS_CD` | **Postback** |

### BC-4: Add Another de Locais de Viagem
- Botão Add Another: `InsertButtonTravelLoc`
- DataList: `dtlTravelLoc`
- Padrão de linha: `dtlTravelLoc_ctl{nn}_tbxSPECTRAVEL_LOCATION`
- A engine deve verificar se a linha já existe (campo visível) antes de clicar Add Another — evita duplicação em retentativas.

### BC-5: Fuzzy Match Obrigatório no `ddlPayerCountry`
O campo de país do pagador (`ddlPayerCountry`) exige fuzzy matching por texto de opção (label), pois os values internos do CEAC podem não corresponder aos códigos ISO. Estratégia:
1. Match exato (case-insensitive) por texto da opção
2. Match parcial por texto da opção
3. Match exato por value do `<option>`
