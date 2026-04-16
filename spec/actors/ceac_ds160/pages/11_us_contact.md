# U.S. Point of Contact (`8 - U.S. Contact`)

## Overview
Mapeia a página de Ponto de Contato nos EUA. O formulário apresenta dois estados mutuamente alternáveis: identificação por **Pessoa** (nome/sobrenome) ou por **Organização**. A alternância é controlada por dois checkboxes independentes que disparam `__doPostBack`.

## Page Rules (do stub original)
- RULE: if contactType == "P" (Person) → show `surname`, `givenName`
- RULE: if contactType == "O" (Organization) → show `organization`

## Navigation Context
- **URL**: `https://ceac.state.gov/GenNIV/General/complete/complete_uscontact.aspx?node=USContact`
- **Previous Page**: Passport (`ctl00$SiteContentPlaceHolder$UpdateButton1`)
- **Next Page**: Family (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors
Prefixo: `ctl00_SiteContentPlaceHolder_FormView1_`

---

### Seção: Contact Person or Organization

#### Subseção: Contact Person (Nome da Pessoa)
Campos ativos quando `cbxUS_POC_NAME_NA` está **desmarcado**.

- **Surnames**:
  - ID: `tbxUS_POC_SURNAME`
  - Type: `<input type="text">` | Max: 33 chars
- **Given Names**:
  - ID: `tbxUS_POC_GIVEN_NAME`
  - Type: `<input type="text">` | Max: 33 chars
- **Do Not Know (Nome)**:
  - ID: `cbxUS_POC_NAME_NA`
  - Type: `<input type="checkbox">`
  - Hidden field: `tbxUS_POC_NAME_NA` → value `Y` quando marcado
  - Trigger: `__doPostBack` → desabilita os campos Surname/GivenName

#### Subseção: Organization Name
Campo ativo quando `cbxUS_POC_ORG_NA_IND` está **desmarcado**.

- **Organization Name**:
  - ID: `tbxUS_POC_ORGANIZATION`
  - Type: `<input type="text">` | Max: 33 chars
  - Estado default: `disabled` (LightGrey) — habilitado ao desmarcar checkbox
- **Do Not Know (Organização)**:
  - ID: `cbxUS_POC_ORG_NA_IND`
  - Type: `<input type="checkbox">`
  - Hidden field: `tbxUS_POC_ORG_NA_IND` → value `Y` (marcado) / `N` (desmarcado)
  - Trigger: `__doPostBack`
  - Estado default: **marcado** no estado "Contact Person", **desmarcado** no estado "Organization"

---

### Relação com o Aplicante

- **Relationship to You**:
  - ID: `ddlUS_POC_REL_TO_APP`
  - Type: `<select>`
  - Trigger: `__doPostBack` ao mudar
  - Options:
    - `R` = RELATIVE
    - `S` = SPOUSE
    - `C` = FRIEND
    - `B` = BUSINESS ASSOCIATE
    - `P` = EMPLOYER
    - `H` = SCHOOL OFFICIAL
    - `O` = OTHER

---

### Seção: Address and Phone Number of Point of Contact
Container: `ctl00_SiteContentPlaceHolder_FormView1_poc`

- **Street Address (Line 1)**:
  - ID: `tbxUS_POC_ADDR_LN1` | Max: 40 chars | Obrigatório
- **Street Address (Line 2)**:
  - ID: `tbxUS_POC_ADDR_LN2` | Max: 40 chars | *Optional*
- **City**:
  - ID: `tbxUS_POC_ADDR_CITY` | Max: 20 chars
- **State**:
  - ID: `ddlUS_POC_ADDR_STATE`
  - Type: `<select>` (50 estados + DC, AS, GU, MP, PR, VI)
  - Sem postback ao mudar
- **ZIP Code**:
  - ID: `tbxUS_POC_ADDR_POSTAL_CD` | Max: 10 chars | Optional (if known)
  - Formato: `55555` ou `55555-5555`
- **Phone Number**:
  - ID: `tbxUS_POC_HOME_TEL` | Max: 15 chars | Min: 5 chars
  - Formato: `5555555555`

---

### Seção: Email Address
Container UpdatePanel: `upnlUS_POC_EMAIL_ADDR`

- **Email Address**:
  - ID: `tbxUS_POC_EMAIL_ADDR` | Max: 50 chars
  - Estado default: `disabled` (LightGrey)
  - Hidden field: `tbxUS_POC_EMAIL_ADDR_NA` → value `Y` quando não aplicável
  - Formato: `emailaddress@example.com`
- **Does Not Apply**:
  - ID: `cbexUS_POC_EMAIL_ADDR_NA`
  - Type: `<input type="checkbox">`
  - Trigger: **JS local** (`enableTbx`) — **sem postback**
  - Estado default: **marcado** (campo email desabilitado)

---

## Estados Condicionais

| Estado | `cbxUS_POC_NAME_NA` | `cbxUS_POC_ORG_NA_IND` | Campos ativos |
|---|---|---|---|
| **Contact Person** | desmarcado | marcado (Y) | Surname + Given Name |
| **Organization** | marcado (Y) | desmarcado | Organization Name |
| **Ambos desconhecidos** | marcado | marcado | Apenas Relationship + Address |

## Automation Constraints
1. **Name/Org toggle**: Verificar estado dos dois checkboxes antes de preencher. Se o necessário estiver marcado, desmarcar e aguardar postback.
2. **Email sem postback**: `cbexUS_POC_EMAIL_ADDR_NA` usa JS local — clicar e preencher sem esperar postback.
3. **`ddlUS_POC_REL_TO_APP` tem postback**: Aguardar hidratação após seleção.
4. **Seção de endereço**: Sempre renderizada, sem dependência condicional.
