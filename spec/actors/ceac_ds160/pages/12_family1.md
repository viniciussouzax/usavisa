# Family 1 — Parents & Relatives (`9 - Family / Relatives`)

## Overview
Mapeia a página `complete_family1.aspx?node=Relatives`. Coleta dados dos pais biológicos/adotivos e lista de parentes imediatos nos EUA. Contém dois padrões distintos: campos simples com `cbx_UNK_IND` (postback para desabilitar DOB), e um DataList `dlUSRelatives` para parentes múltiplos.

## Page Rules (do stub original)
- RULE: if fatherInUS == "Y" → show `fatherUSStatus`
- RULE: if motherInUS == "Y" → show `motherUSStatus`
- RULE: if immediateRelativesInUS == "N" → show `otherRelativesInUS` question
- RULE: if immediateRelativesInUS == "Y" → show array `dlUSRelatives`
- RULE: if immediateRelativesInUS == "Y" → show array `dlUSRelatives`
- RULE: if otherRelativesInUS == "Y" → array not used but input required
- **Do you have any other relatives in the United States?**
  - Radio Yes/No: `rblUS_OTHER_RELATIVE_IND`
- **URL**: `https://ceac.state.gov/GenNIV/General/complete/complete_family1.aspx?node=Relatives`
- **Previous Page**: U.S. Contact (`ctl00$SiteContentPlaceHolder$UpdateButton1`)
- **Next Page**: Spouse (`ctl00$SiteContentPlaceHolder$UpdateButton3`)
- **Save Button**: `ctl00$SiteContentPlaceHolder$UpdateButton2`

## Base Selectors
Prefixo: `ctl00_SiteContentPlaceHolder_FormView1_`

---

### Seção: Father's Full Name and Date of Birth

- **Surnames**:
  - ID: `tbxFATHER_SURNAME` | Max: 33 chars
  - Hidden: `tbxFATHER_SURNAME_UNK_IND` (value `N` = conhecido)
  - Do Not Know: `cbxFATHER_SURNAME_UNK_IND` → Trigger: `__doPostBack`

- **Given Names**:
  - ID: `tbxFATHER_GIVEN_NAME` | Max: 33 chars
  - Hidden: `tbxFATHER_GIVEN_NAME_UNK_IND` (value `N` = conhecido)
  - Do Not Know: `cbxFATHER_GIVEN_NAME_UNK_IND` → Trigger: `__doPostBack`

- **Date of Birth**:
  - Day: `ddlFathersDOBDay` | Month: `ddlFathersDOBMonth` | Year: `tbxFathersDOBYear` (Max 4)
  - Hidden: `tbxFATHER_DOB_UNK_IND` (value `Y` = desconhecido)
  - Do Not Know: `cbxFATHER_DOB_UNK_IND` → Trigger: `__doPostBack`
  - Estado default: campos de data **desabilitados** (LightGrey) quando `cbxFATHER_DOB_UNK_IND` marcado
  - Formato: `DD-MMM-YYYY`

- **Is your father in the U.S.?**:
  - Container: `FatherLiveInUS`
  - Radio Yes: `rblFATHER_LIVE_IN_US_IND_0` (value: `Y`) — sem postback
  - Radio No: `rblFATHER_LIVE_IN_US_IND_1` (value: `N`) → Trigger: `__doPostBack`
  - **Condicional (se Yes)**:
    - Container: `ShowDivFatherStatus`
    - **Father's Status**:
      - ID: `ddlFATHER_US_STATUS`
      - Type: `<select>` | Sem postback
      - Options:
        - `S` = U.S. CITIZEN
        - `C` = U.S. LEGAL PERMANENT RESIDENT (LPR)
        - `P` = NONIMMIGRANT
        - `O` = OTHER/I DON'T KNOW

---

### Seção: Mother's Full Name and Date of Birth

- **Surnames**:
  - ID: `tbxMOTHER_SURNAME` | Max: 33 chars
  - Hidden: `tbxMOTHER_SURNAME_UNK_IND`
  - Do Not Know: `cbxMOTHER_SURNAME_UNK_IND` → Trigger: `__doPostBack`

- **Given Names**:
  - ID: `tbxMOTHER_GIVEN_NAME` | Max: 33 chars
  - Hidden: `tbxMOTHER_GIVEN_NAME_UNK_IND`
  - Do Not Know: `cbxMOTHER_GIVEN_NAME_UNK_IND` → Trigger: `__doPostBack`

- **Date of Birth**:
  - Day: `ddlMothersDOBDay` | Month: `ddlMothersDOBMonth` | Year: `tbxMothersDOBYear`
  - Hidden: `tbxMOTHER_DOB_UNK_IND` (value `Y` = desconhecido)
  - Do Not Know: `cbxMOTHER_DOB_UNK_IND` → Trigger: `__doPostBack`
  - Estado default: campos desabilitados (LightGrey)

- **Is your mother in the U.S.?**:
  - Container: `MotherLiveInUS`
  - Radio Yes: `rblMOTHER_LIVE_IN_US_IND_0` (value: `Y`) — sem postback
  - Radio No: `rblMOTHER_LIVE_IN_US_IND_1` (value: `N`) → Trigger: `__doPostBack`
  - **Condicional (se Yes)**:
    - Container: `ShowDivMotherStatus`
    - **Mother's Status**:
      - ID: `ddlMOTHER_US_STATUS`
      - Options: mesmo conjunto do pai (S/C/P/O)

---

### Seção: Immediate Relatives in the U.S. (DataList)
Container UpdatePanel: `upnlUS_RELATIVES`

- **Do you have any immediate relatives in the U.S.?**:
  - Radio Yes: `rblUS_IMMED_RELATIVE_IND_0` (value: `Y`) — sem postback
  - Radio No: `rblUS_IMMED_RELATIVE_IND_1` (value: `N`) → Trigger: `__doPostBack`

- **Condicional (se Yes)**:
  - Container: `ShowAddlUSRelatives`
  - DataList: `dlUSRelatives`
  - Padrão de seletor: `dlUSRelatives_[INDEX]_CAMPO`

  #### Por item do array `dlUSRelatives`:
  - **Surnames**: `dlUSRelatives_[INDEX]_tbxUS_REL_SURNAME` | Max: 33 chars
  - **Given Names**: `dlUSRelatives_[INDEX]_tbxUS_REL_GIVEN_NAME` | Max: 33 chars
  - **Relationship to You**: `dlUSRelatives_[INDEX]_ddlUS_REL_TYPE`
    - Options: `S` = SPOUSE | `F` = FIANCÉ/FIANCÉE | `C` = CHILD | `B` = SIBLING
    - Sem postback
  - **Relative's Status**: `dlUSRelatives_[INDEX]_ddlUS_REL_STATUS`
    - Options: `S` = U.S. CITIZEN | `C` = LPR | `P` = NONIMMIGRANT | `O` = OTHER/I DON'T KNOW
    - Sem postback
  - **Add Another**: `dlUSRelatives_[INDEX]_InsertButtonUSRelative` → `__doPostBack`
  - **Remove**: `dlUSRelatives_[INDEX]_DeleteButtonUSRelative` → `__doPostBack`

> **Definição de "Immediate Relative"**: fiancé/fiancée, spouse, child (son/daughter), ou sibling (brother/sister).

## Automation Constraints
1. **DOB defaults desabilitados**: Para pais, os campos de data de nascimento chegam desabilitados por padrão. O engine deve desmarcar `cbx_DOB_UNK_IND` e aguardar postback antes de preencher.
2. **Status condicional (pai/mãe in US)**: Ao marcar `Yes` para pai ou mãe nos EUA, aguardar postback antes de selecionar o status.
3. **DataList `dlUSRelatives`**: Padrão `[INDEX]` (ctl00, ctl01...). Iniciar apenas com o primeiro registro; clicar `InsertButtonUSRelative` e aguardar postback para cada novo parente.
4. **rblUS_OTHER_RELATIVE_IND**: O campo de outros parentes nos EUA existe como radio button (Y/N) e se marcado como "Y" não dispara postback ou DataList adicional no dump atual. Deve ser mapeado diretamente como radio na engine.
