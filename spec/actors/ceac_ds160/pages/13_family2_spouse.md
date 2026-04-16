# Family 2 — Spouse (`9 - Family / Spouse`)

## Overview
Mapeia a página `complete_family2.aspx?node=Spouse`. Exibida apenas quando o estado civil do aplicante é **Married** ou **Civil Union**. Contém dados do cônjuge atual: nome completo, DOB, nacionalidade, local de nascimento e endereço residencial (com 5 modos configuráveis via postback).

## Page Rules (do stub original)
- RULE: if maritalStatus not in ("M", "C") → skip page entirely
- RULE: if spouseAddress == "O" → show address fields
- RULE: if spouseAddress == "D" → hide address fields

## Navigation Context
- **URL**: `https://ceac.state.gov/GenNIV/General/complete/complete_family2.aspx?node=Spouse`
- **Previous Page**: Relatives (`ctl00$SiteContentPlaceHolder$UpdateButton1`)
- **Next Page**: Work/Education (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors
Prefixo: `ctl00_SiteContentPlaceHolder_FormView1_`

---

### Seção: Spouse's Full Name (include Maiden Name)

- **Surnames**:
  - ID: `tbxSpouseSurname` | Max: 33 chars | Obrigatório
- **Given Names**:
  - ID: `tbxSpouseGivenName` | Max: 33 chars | Obrigatório

---

### Seção: Spouse's Date of Birth

- Day: `ddlDOBDay` | Month: `ddlDOBMonth` | Year: `tbxDOBYear` (Max 4)
- Formato: `DD-MMM-YYYY`
- Sem postback ao alterar

---

### Seção: Spouse's Country/Region of Origin (Nationality)

- ID: `ddlSpouseNatDropDownList`
- Type: `<select>` | Sem postback
- Lista padrão de países CEAC

---

### Seção: Spouse's Place of Birth

- **City**:
  - ID: `tbxSpousePOBCity` | Max: 20 chars
  - Estado default: habilitado (White)
  - Hidden: `tbxSpousePOBCity_NA` (value `N` = conhecido / `Y` = desconhecido)
  - Do Not Know: `cbexSPOUSE_POB_CITY_NA`
  - Trigger: **JS local** (`enableTbx`) — **sem postback**

- **Country/Region**:
  - ID: `ddlSpousePOBCountry`
  - Type: `<select>` | Sem postback
  - Lista estendida (inclui territórios, estados mexicanos)

---

### Seção: Spouse's Address
Container UpdatePanel: `upnlSpouseAddress`

- **Address Type**:
  - ID: `ddlSpouseAddressType`
  - Trigger: `__doPostBack` ao mudar
  - Options:
    - `H` = Same as Home Address
    - `M` = Same as Mailing Address
    - `U` = Same as U.S. Contact Address
    - `D` = Do Not Know
    - `O` = Other (Specify Address)

- **Condicional (se == `O`)** — Container: `ShowDivSpouseAddress`:

  - **Street Address (Line 1)**:
    - ID: `tbxSPOUSE_ADDR_LN1` | Max: 40 chars
    - Note: Postal box numbers not allowed
  - **Street Address (Line 2)**:
    - ID: `tbxSPOUSE_ADDR_LN2` | Max: 40 chars | *Optional*
  - **City**:
    - ID: `tbxSPOUSE_ADDR_CITY` | Max: 20 chars
  - **State/Province**:
    - ID: `tbxSPOUSE_ADDR_STATE` | Max: 20 chars
    - Hidden: `tbxSPOUSE_ADDR_STATE_NA` | Does Not Apply: `cbexSPOUSE_ADDR_STATE_NA`
    - Trigger: **JS local** (`enableTbx`) — sem postback
  - **Postal Zone/ZIP Code**:
    - ID: `tbxSPOUSE_ADDR_POSTAL_CD` | Max: 10 chars
    - Hidden: `tbxSPOUSE_ADDR_POSTAL_CD_NA` | Does Not Apply: `cbexSPOUSE_ADDR_POSTAL_CD_NA`
    - Trigger: **JS local** — sem postback
  - **Country/Region**:
    - ID: `ddlSPOUSE_ADDR_CNTRY` | `<select>` | Sem postback

---

## Automation Constraints
1. **Visibilidade condicional da página**: Verificar `maritalStatus` antes de navegar. Se não for `M` ou `C`, pular para Family Next.
2. **`ddlSpouseAddressType` com postback**: Aguardar hidratação após seleção. Se `D`, os campos de endereço não aparecem.
3. **`cbexSPOUSE_POB_CITY_NA` sem postback**: Usar JS local; clicar e verificar estado do campo sem aguardar postback.
4. **`cbexSPOUSE_ADDR_STATE_NA` e `cbexSPOUSE_ADDR_POSTAL_CD_NA`**: Mesma lógica JS local.
5. **Nota on `ShowDivSpouseAddressQuestion2`**: Container pai que pode ocultar toda a seção de endereço quando tipo é `H`, `M` ou `U` (mesmos endereços já preenchidos). Engine deve detectar visibilidade desse container.
