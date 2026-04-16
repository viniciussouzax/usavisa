# Family 3 — Deceased Spouse (`9 - Family / Deceased Spouse`)

## Overview
Mapeia a página `complete_family5.aspx?node=DeceasedSpouse`. Exibida apenas quando o estado civil do aplicante é **Widowed**. Captura dados do cônjuge falecido: nome, DOB, nacionalidade e local de nascimento. Página simples, sem DataList — apenas um registro.

## Page Rules (do stub original)
- RULE: if maritalStatus != "W" → skip page entirely

## Navigation Context
- **URL**: `https://ceac.state.gov/GenNIV/General/complete/complete_family5.aspx?node=DeceasedSpouse`
- **Previous Page**: Relatives (implícito — botão `ctl00$SiteContentPlaceHolder$UpdateButton1`)
- **Next Page**: Work/Education (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors
Prefixo: `ctl00_SiteContentPlaceHolder_FormView1_`

---

### Seção: Deceased Spouse's Full Name

- **Surname**:
  - ID: `tbxSURNAME` | Max: 33 chars | Obrigatório
- **Given Name**:
  - ID: `tbxGIVEN_NAME` | Max: 33 chars | Obrigatório

---

### Seção: Date of Birth

- Day: `ddlDOBDay` | Month: `ddlDOBMonth` | Year: `tbxDOBYear` (Max 4)
- Formato: `DD-MMM-YYYY`
- Sem postback ao alterar

---

### Seção: Country/Region of Origin (Nationality)
Container: `PobAndNatl`

- ID: `ddlSpouseNatDropDownList`
- Type: `<select>` | Sem postback
- Lista padrão de países CEAC

---

### Seção: Deceased Spouse's Place of Birth
Container: `PobAndNatl` (mesmo container da nationalidade)

- **City**:
  - ID: `tbxSpousePOBCity` | Max: 20 chars
  - Hidden: `tbxSpousePOBCity_NA` (sem valor inicial no dump = vazio)
  - Do Not Know: `cbxSPOUSE_POB_CITY_NA`
  - Trigger: `__doPostBack` (diferente do Spouse ativo — este usa postback!)

- **Country/Region**:
  - ID: `ddlSpousePOBCountry`
  - Type: `<select>` | Sem postback
  - Lista estendida (inclui territórios e entrada "AT SEA", "IN THE AIR", etc.)

---

## Diferenças críticas em relação ao Spouse ativo (pág. 13)

| Campo | Spouse (`13`) | Deceased Spouse (`14`) |
|---|---|---|
| POB City toggle | JS local (`enableTbx`) | `__doPostBack` |
| Seção endereço | Sim (5 modos) | **Não existe** |
| DataList | Não | **Não** |
| Número de registros | 1 | 1 |

## Automation Constraints
1. **Visibilidade condicional da página**: Verificar `maritalStatus == "W"` (Widowed) antes de navegar.
2. **`cbxSPOUSE_POB_CITY_NA` usa postback**: Aguardar hidratação após clicar, diferente da página 13.
3. **Sem seção de endereço**: Página termina após Place of Birth. Não tentar preencher campos de endereço.
4. **IDs compartilhados com outras páginas** (`tbxSURNAME`, `ddlDOBDay`, etc.): O engine DEVE validar a URL antes de interagir para evitar colisões de seletor.
