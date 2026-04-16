# Family 4 — Previous Spouse (`9 - Family / Former Spouse`)

## Overview
Mapeia a página `complete_family4.aspx?node=PrevSpouse`. Exibida quando o estado civil é **Divorced**, **Separated**, ou quando o usuário declarou ex-cônjuges em alguma tela anterior. Coleta dados de ex-cônjuges via DataList `DListSpouse` (suporta múltiplos registros). Cada registro contém: nome, DOB, nacionalidade, lugar de nascimento, data do casamento, data de término, como o casamento terminou e país de dissolução.

## Page Rules (do stub original)
- RULE: if maritalStatus not in ("D", "P", "S") → skip page entirely (ver nota)
- NOTE: A página também é exibida caso o aplicante preencha `tbxNumberOfPrevSpouses > 0` em qualquer estado civil

## Navigation Context
- **URL**: `https://ceac.state.gov/GenNIV/General/complete/complete_family4.aspx?node=PrevSpouse`
- **Previous Page**: Relatives (`ctl00$SiteContentPlaceHolder$UpdateButton1` → Back: Relatives)
- **Next Page**: Work/Education (`ctl00$SiteContentPlaceHolder$UpdateButton3` → Next: Work/Education/Training)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors
Prefixo: `ctl00_SiteContentPlaceHolder_FormView1_`

---

### Seção: Number of Former Spouses
Container: `ShowAddSpouses`

- **Number of Former Spouses**:
  - ID: `tbxNumberOfPrevSpouses`
  - Type: `<input text>` | Max: 2 chars
  - Trigger: `__doPostBack` ao sair do campo (`onchange`)
  - Comportamento: postback inicializa/expande o DataList `DListSpouse` com N slots

---

### Seção: Former Spouse Information (DataList)
DataList ID: `DListSpouse`
Padrão de seletor: `DListSpouse_[INDEX]_CAMPO`

#### Por item do array `DListSpouse`:

- **Surnames**:
  - ID: `DListSpouse_[INDEX]_tbxSURNAME` | Max: 33 chars
- **Given Names**:
  - ID: `DListSpouse_[INDEX]_tbxGIVEN_NAME` | Max: 33 chars

- **Date of Birth**:
  - Day: `DListSpouse_[INDEX]_ddlDOBDay`
  - Month: `DListSpouse_[INDEX]_ddlDOBMonth`
  - Year: `DListSpouse_[INDEX]_tbxDOBYear` (Max 4)
  - Formato: `DD-MMM-YYYY`
  - Sem postback

- **Country/Region of Origin (Nationality)**:
  - ID: `DListSpouse_[INDEX]_ddlSpouseNatDropDownList`
  - Type: `<select>` | Sem postback

- **Former Spouse's Place of Birth**:
  - **City**: `DListSpouse_[INDEX]_tbxSpousePOBCity` | Max: 20 chars
    - Hidden: `DListSpouse_[INDEX]_tbxSpousePOBCity_NA`
    - Do Not Know: `DListSpouse_[INDEX]_cbxSPOUSE_POB_CITY_NA` → `__doPostBack`
  - **Country/Region**: `DListSpouse_[INDEX]_ddlSpousePOBCountry`
    - Type: `<select>` | Sem postback

- **Date of Marriage**:
  - Day: `DListSpouse_[INDEX]_ddlDomDay`
  - Month: `DListSpouse_[INDEX]_ddlDomMonth`
  - Year: `DListSpouse_[INDEX]_txtDomYear` (Max 4) ← **`txt` não `tbx`!**
  - Formato: `DD-MMM-YYYY`

- **Date Marriage Ended**:
  - Day: `DListSpouse_[INDEX]_ddlDomEndDay`
  - Month: `DListSpouse_[INDEX]_ddlDomEndMonth`
  - Year: `DListSpouse_[INDEX]_txtDomEndYear` (Max 4) ← **`txt` não `tbx`!**
  - Formato: `DD-MMM-YYYY`

- **How the Marriage Ended**:
  - ID: `DListSpouse_[INDEX]_tbxHowMarriageEnded`
  - Type: `<textarea>` | Max: 4000 chars
  - rows=2, cols=20

- **Country/Region Marriage was Terminated**:
  - ID: `DListSpouse_[INDEX]_ddlMarriageEnded_CNTRY`
  - Type: `<select>` | Sem postback

- **Add Another**: `DListSpouse_[INDEX]_InsertButtonSpouse` → `__doPostBack`
  - Estado default: `disabled` — habilitado após `tbxNumberOfPrevSpouses` ser preenchido
- **Remove**: `DListSpouse_[INDEX]_DeleteButtonSpouse` → `__doPostBack`
  - Estado default: `disabled` — habilitado apenas quando existem ≥ 2 registros

> **⚠️ ATENÇÃO**: O DataList desta página usa ID `DListSpouse` (com "D" maiúsculo), diferente de `dlUSRelatives` na página 12. O padrão de index é o mesmo (`ctl00`, `ctl01`...).

---

## Automation Constraints
1. **Preencher `tbxNumberOfPrevSpouses` primeiro**: Este campo controla a quantidade de registros do DataList. Preencher com o número correto e aguardar postback antes de preencher qualquer campo filho.
2. **Nomes de campos com `txt` (não `tbx`)**: `txtDomYear` e `txtDomEndYear` são exceções ao padrão `tbx` da maioria dos campos. Confirmar seletores antes de interagir.
3. **`cbxSPOUSE_POB_CITY_NA` usa postback**: Aguardar hidratação após marcar/desmarcar.
4. **`InsertButtonSpouse` inicia desabilitado**: Verificar se o botão está habilitado antes de clicar; se não, significa que `tbxNumberOfPrevSpouses` não foi processado pelo servidor.
5. **Gestão de linhas vazias**: A engine deve limpar registros extras (DataList cleanup) se `tbxNumberOfPrevSpouses` for alterado para um valor menor após inserção prévia.
6. **IDs compartilhados**: Como `tbxSURNAME`, `tbxGIVEN_NAME` e `ddlDOBDay` aparecem em múltiplas páginas da Family, o engine DEVE validar a URL atual antes de interagir.
