# 18. Work/Education 3 (Additional)

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_workeducation3.aspx?node=WorkEducation3`
**Título CEAC:** Additional Work/Education/Training Information
**Nota CEAC:** "Provide the following work, education, or training related information. Provide complete and accurate information to all questions that require an explanation."
**Navegação:** Back → Work/Education: Previous | Next → Security and Background

---

## Regras de Negócio (preservadas do stub)

- RULE: if `clanTribe == "Y"` → show `tbxCLAN_TRIBE_NAME`
- RULE: if `countriesVisited == "Y"` → show array `dtlCountriesVisited`
- RULE: if `organizationMember == "Y"` → show array `organizations`
- RULE: if `specializedSkills == "Y"` → show `specializedSkillsExplanation`
- RULE: if `militaryService == "Y"` → show array `military`
- RULE: if `insurgentOrg == "Y"` → show `insurgentOrgExplanation`

---

## Seção 1 — Clan or Tribe

### Campo Gate: Do you belong to a clan or tribe?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND` |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N`: `__doPostBack('...rblCLAN_TRIBE_IND$1', '')` |
| Div target  | `ctl00_SiteContentPlaceHolder_FormView1_CLAN_TRIBE` |
| UpdatePanel | `ctl00_SiteContentPlaceHolder_FormView1_upnlClan` |

**IDs individuais:**

| Valor | ID |
|-------|----|
| `Y`   | `ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_0` |
| `N`   | `ctl00_SiteContentPlaceHolder_FormView1_rblCLAN_TRIBE_IND_1` |

### Campo Condicional: Clan or Tribe Name

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxCLAN_TRIBE_NAME` |
| maxlength   | 80 |
| width       | 280px |
| Obrigatório | Sim (quando visível) |

---

## Seção 2 — Languages Spoken (DataList obrigatória, sem gate)

> Não há pergunta Y/N. A DataList `dtlLANGUAGES` é sempre exibida.
> Container: `ctl00_SiteContentPlaceHolder_FormView1_LANGUAGES`
> DataList ID: `ctl00_SiteContentPlaceHolder_FormView1_dtlLANGUAGES`

### Campo por entrada (índice `ctl{NN}`)

#### Language Name

| ID pattern  | `...dtlLANGUAGES_ctl{NN}_tbxLANGUAGE_NAME` |
|-------------|----------------------------------------------|
| maxlength   | 66 |
| width       | 275px |
| Obrigatório | Sim (ao menos 1 entrada) |

### Controles Add/Remove

| Ação        | ID pattern                                            | Postback trigger |
|-------------|-------------------------------------------------------|------------------|
| Add Another | `...dtlLANGUAGES_ctl{NN}_InsertButtonLANGUAGE`      | `__doPostBack('...dtlLANGUAGES$ctl{NN}$InsertButtonLANGUAGE', '')` |
| Remove      | `...dtlLANGUAGES_ctl{NN}_DeleteButtonLANGUAGE`      | `__doPostBack('...dtlLANGUAGES$ctl{NN}$DeleteButtonLANGUAGE', '')` |

---

## Seção 3 — Countries/Regions Visited (últimos 5 anos)

### Campo Gate: Have you traveled to any countries/regions within the last five years?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND` |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N`: `__doPostBack('...rblCOUNTRIES_VISITED_IND$1', '')` |
| Div target  | `ctl00_SiteContentPlaceHolder_FormView1_COUNTRIES_VISITED` |
| UpdatePanel | `ctl00_SiteContentPlaceHolder_FormView1_upnlCOUNTRIES_VISITED_IND` |

**IDs individuais:**

| Valor | ID |
|-------|----|
| `Y`   | `ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_0` |
| `N`   | `ctl00_SiteContentPlaceHolder_FormView1_rblCOUNTRIES_VISITED_IND_1` |

### DataList: `dtlCountriesVisited`

> DataList ID: `ctl00_SiteContentPlaceHolder_FormView1_dtlCountriesVisited`

#### Campo por entrada (índice `ctl{NN}`)

| Campo | ID pattern | Tipo |
|-------|------------|------|
| Country/Region | `...dtlCountriesVisited_ctl{NN}_ddlCOUNTRIES_VISITED` | `<select>` (lista completa de países CEAC) |

#### Controles Add/Remove

| Ação        | ID pattern | Postback trigger |
|-------------|------------|------------------|
| Add Another | `...dtlCountriesVisited_ctl{NN}_InsertButtonCountriesVisited` | `__doPostBack('...dtlCountriesVisited$ctl{NN}$InsertButtonCountriesVisited', '')` |
| Remove      | `...dtlCountriesVisited_ctl{NN}_DeleteButtonCountriesVisited` | `__doPostBack('...dtlCountriesVisited$ctl{NN}$DeleteButtonCountriesVisited', '')` |

> **Estratégia de automação:** Mesma política de DataList das seções anteriores — preencher todas as entradas, remover última linha vazia antes de avançar.

---

## Seção 3.5 — Organizations

### Campo Gate: Do you belong to, contribute to, or work for any professional, social, or charitable organization?
- ID (grupo): `ctl00_SiteContentPlaceHolder_FormView1_rblORGANIZATION_IND`
- Opções: `Y` / `N`
- Postback: Selecionar `N` dispara `__doPostBack`

### DataList: `dtlORGANIZATIONS` (quando Y)
Container: `ctl00_SiteContentPlaceHolder_FormView1_dtlORGANIZATIONS`
- Organization Name: `...dtlORGANIZATIONS_ctl{NN}_tbxORGANIZATION_NAME`
- Add Another: `...dtlORGANIZATIONS_ctl{NN}_InsertButtonORG`
- Remove: `...dtlORGANIZATIONS_ctl{NN}_DeleteButtonORG`

## Seção 4 — Specialized Skills

> ⚠️ Identificada no dump como presente nesta página, mapeada com base no padrão `ShowHideDiv` das demais seções.

### Campo Gate: Do you have any specialized skills or training?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblSPECIALIZED_SKILLS_IND` |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N`: `__doPostBack('...rblSPECIALIZED_SKILLS_IND$1', '')` |

### Campo Condicional: Explain

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSPECIALIZED_SKILLS_EXPL` |
| Tipo        | `<textarea>` |
| maxlength   | 4000 |
| Obrigatório | Sim (quando visível) |

---

## Seção 5 — Military Service

### Campo Gate: Have you served in the military?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblMILITARY_SERVICE_IND` |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N`: `__doPostBack('...rblMILITARY_SERVICE_IND$1', '')` |

### DataList: `dtlMILITARY_SERVICE` (quando Y)

Campos esperados por entrada (padrão `ctl{NN}`):

| Campo | ID pattern |
|-------|------------|
| Country | `...dtlMILITARY_SERVICE_ctl{NN}_ddlMILITARY_SVC_CNTRY` |
| Branch | `...dtlMILITARY_SERVICE_ctl{NN}_tbxMILITARY_SVC_BRANCH` |
| Rank | `...dtlMILITARY_SERVICE_ctl{NN}_tbxMILITARY_SVC_RANK` |
| Specialty | `...dtlMILITARY_SERVICE_ctl{NN}_tbxMILITARY_SVC_SPECIALTY` |
| Date From (Day/Month/Year) | `...dtlMILITARY_SERVICE_ctl{NN}_ddlMILITARY_SVC_FROMDay` / `...dtlMILITARY_SERVICE_ctl{NN}_ddlMILITARY_SVC_FROMMonth` / `...dtlMILITARY_SERVICE_ctl{NN}_tbxMILITARY_SVC_FROMYear` |
| Date To (Day/Month/Year) | `...dtlMILITARY_SERVICE_ctl{NN}_ddlMILITARY_SVC_TODay` / `...dtlMILITARY_SERVICE_ctl{NN}_ddlMILITARY_SVC_TOMonth` / `...dtlMILITARY_SERVICE_ctl{NN}_tbxMILITARY_SVC_TOYear` |

---

## Seção 6 — Insurgent / Paramilitary Organization

### Campo Gate: Have you ever served in, been a member of, or been involved with a paramilitary unit, vigilante unit, rebel group, guerrilla group, or insurgent organization?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblINSURGENT_ORG_IND` |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N`: `__doPostBack('...rblINSURGENT_ORG_IND$1', '')` |

### Campo Condicional: Explain

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxINSURGENT_ORG_EXPL` |
| Tipo        | `<textarea>` |
| maxlength   | 4000 |
| Obrigatório | Sim (quando visível) |

---

## Lógica Condicional Resumida

```
rblCLAN_TRIBE_IND
  └── "Y" → exibir CLAN_TRIBE (tbxCLAN_TRIBE_NAME)
  └── "N" → __doPostBack → ocultar CLAN_TRIBE

[dtlLANGUAGES — sempre visível, min. 1 entrada]

rblCOUNTRIES_VISITED_IND
  └── "Y" → exibir COUNTRIES_VISITED (dtlCountriesVisited)
  └── "N" → __doPostBack → ocultar COUNTRIES_VISITED

rblSPECIALIZED_SKILLS_IND
  └── "Y" → exibir tbxSPECIALIZED_SKILLS_EXPL
  └── "N" → __doPostBack → ocultar

rblMILITARY_SERVICE_IND
  └── "Y" → exibir dtlMILITARY
  └── "N" → __doPostBack → ocultar dtlMILITARY

rblINSURGENT_ORG_IND
  └── "Y" → exibir tbxINSURGENT_ORG_EXPL
  └── "N" → __doPostBack → ocultar
```

---

## Navegação

| Botão | ID | Ação |
|-------|----|------|
| Back  | `ctl00_SiteContentPlaceHolder_UpdateButton1` | Volta para Work/Education: Previous |
| Save  | `ctl00_SiteContentPlaceHolder_UpdateButton2` | Salva sem avançar |
| Next  | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança para Security and Background |
