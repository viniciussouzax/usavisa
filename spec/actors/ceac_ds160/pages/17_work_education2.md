# 17. Work/Education 2 (Previous)

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_workeducation2.aspx?node=WorkEducation2`
**Título CEAC:** Previous Work/Education/Training Information
**Nota CEAC:** "Provide your employment information for the last five years that you were employed, if applicable."
**Navegação:** Back → Work/Education: Present | Next → Work/Education: Additional

---

## Regras de Negócio (preservadas do stub)

- RULE: if `rblPreviouslyEmployed == "Y"` → ACTION: show bloco `ViewDivPreviouslyEmployed` (DataList `dtlPrevEmpl`)
- RULE: if `rblPreviouslyEmployed == "N"` → ACTION: ocultar DataList; dispara `__doPostBack` para atualizar servidor

---

## Seção 1 — Previously Employed?

### Campo Gate: Were you previously employed?

| Propriedade | Valor |
|-------------|-------|
| ID (grupo)  | `ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed` |
| Tipo        | `<table>` com radio buttons |
| Opções      | `Y` = Yes / `N` = No |
| Postback    | Selecionar `N` dispara: `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$rblPreviouslyEmployed$1', '')` |
| Div target  | `ctl00_SiteContentPlaceHolder_FormView1_ViewDivPreviouslyEmployed` |

**IDs individuais dos radio buttons:**

| Valor | ID do input |
|-------|-------------|
| `Y`   | `ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_0` |
| `N`   | `ctl00_SiteContentPlaceHolder_FormView1_rblPreviouslyEmployed_1` |

---

## Seção 2 — DataList: Empregadores Anteriores (`dtlPrevEmpl`)

> Visível quando `rblPreviouslyEmployed == "Y"`
> Container pai: `ctl00_SiteContentPlaceHolder_FormView1_ViewDivPreviouslyEmployed`
> DataList ID: `ctl00_SiteContentPlaceHolder_FormView1_dtlPrevEmpl`

### Padrão de índice

Cada linha da DataList usa o índice `ctl00` (primeiro), `ctl01` (segundo), etc.  
Template de ID de cada campo: `...dtlPrevEmpl_ctl{NN}_{campoId}`

A engine deve iterar pelos índices conforme o número de entradas. A última linha vazia deve ser removida via postback antes de avançar.

---

### Campos por entrada (por índice `ctl{NN}`)

#### A. Employer Name

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbEmployerName` |
|-------------|------------------------------------------|
| maxlength   | 75                                       |
| width       | 300px                                    |
| Obrigatório | Sim                                      |

#### B. Employer Street Address (Line 1)

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbEmployerStreetAddress1` |
|-------------|---------------------------------------------------|
| maxlength   | 40                                                |
| Obrigatório | Sim                                               |

#### C. Employer Street Address (Line 2)

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbEmployerStreetAddress2` |
|-------------|---------------------------------------------------|
| maxlength   | 40                                                |
| Obrigatório | Não (*Optional*)                                  |

#### D. City

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbEmployerCity` |
|-------------|------------------------------------------|
| maxlength   | 20                                       |
| Obrigatório | Sim                                      |

#### E. State/Province

| ID pattern (texto)   | `...dtlPrevEmpl_ctl{NN}_tbxPREV_EMPL_ADDR_STATE`    |
|----------------------|------------------------------------------------------|
| ID pattern (checkbox N/A) | `...dtlPrevEmpl_ctl{NN}_cbxPREV_EMPL_ADDR_STATE_NA` |
| maxlength            | 20                                                   |
| Postback checkbox    | `__doPostBack('...dtlPrevEmpl$ctl{NN}$cbxPREV_EMPL_ADDR_STATE_NA', '')` |
| Obrigatório          | Sim (ou marcar "Does Not Apply")                     |
| UpdatePanel          | `...dtlPrevEmpl_ctl{NN}_upnlPrevEmplState`           |

#### F. Postal Zone/ZIP Code

| ID pattern (texto)   | `...dtlPrevEmpl_ctl{NN}_tbxPREV_EMPL_ADDR_POSTAL_CD`    |
|----------------------|----------------------------------------------------------|
| ID pattern (checkbox N/A) | `...dtlPrevEmpl_ctl{NN}_cbxPREV_EMPL_ADDR_POSTAL_CD_NA` |
| maxlength            | 10                                                       |
| Postback checkbox    | `__doPostBack('...dtlPrevEmpl$ctl{NN}$cbxPREV_EMPL_ADDR_POSTAL_CD_NA', '')` |
| Obrigatório          | Sim (ou marcar "Does Not Apply")                         |
| UpdatePanel          | `...dtlPrevEmpl_ctl{NN}_upnlPrevEmplZip`                 |

#### G. Country/Region

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_DropDownList2` |
|-------------|----------------------------------------|
| Tipo        | `<select>` (lista completa de países CEAC) |
| Obrigatório | Sim                                    |

> ⚠️ **Atenção:** Este campo usa o ID genérico `DropDownList2`, não um nome descritivo. O seletor deve ser preciso.

#### H. Telephone Number

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbEmployerPhone` |
|-------------|-------------------------------------------|
| maxlength   | 15                                        |
| minlength   | 5                                         |
| Obrigatório | Sim                                       |

#### I. Job Title

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbJobTitle` |
|-------------|--------------------------------------|
| maxlength   | 75                                   |
| Obrigatório | Sim                                  |

#### J. Supervisor's Surname

| ID pattern (texto)   | `...dtlPrevEmpl_ctl{NN}_tbSupervisorSurname`         |
|----------------------|------------------------------------------------------|
| ID pattern (N/A hidden) | `...dtlPrevEmpl_ctl{NN}_tbSupervisorSurname_NA`   |
| ID pattern (checkbox N/A) | `...dtlPrevEmpl_ctl{NN}_cbxSupervisorSurname_NA` |
| maxlength            | 33                                                   |
| Postback checkbox    | `__doPostBack('...dtlPrevEmpl$ctl{NN}$cbxSupervisorSurname_NA', '')` |
| Obrigatório          | Sim (ou marcar "Do Not Know")                        |

#### K. Supervisor's Given Names

| ID pattern (texto)   | `...dtlPrevEmpl_ctl{NN}_tbSupervisorGivenName`         |
|----------------------|--------------------------------------------------------|
| ID pattern (N/A hidden) | `...dtlPrevEmpl_ctl{NN}_tbSupervisorGivenName_NA`   |
| ID pattern (checkbox N/A) | `...dtlPrevEmpl_ctl{NN}_cbxSupervisorGivenName_NA` |
| maxlength            | 33                                                     |
| Postback checkbox    | `__doPostBack('...dtlPrevEmpl$ctl{NN}$cbxSupervisorGivenName_NA', '')` |
| Obrigatório          | Sim (ou marcar "Do Not Know")                          |

#### L. Employment Date From (Início)

Composto por 3 elementos:

| Elemento | ID pattern | Tipo |
|----------|------------|------|
| Day      | `...dtlPrevEmpl_ctl{NN}_ddlEmpDateFromDay`    | `<select>` 1–31 |
| Month    | `...dtlPrevEmpl_ctl{NN}_ddlEmpDateFromMonth`  | `<select>` JAN–DEC |
| Year     | `...dtlPrevEmpl_ctl{NN}_tbxEmpDateFromYear`   | `<input>` maxlength=4 |

Formato: `DD-MMM-YYYY`

#### M. Employment Date To (Fim)

Composto por 3 elementos:

| Elemento | ID pattern | Tipo |
|----------|------------|------|
| Day      | `...dtlPrevEmpl_ctl{NN}_ddlEmpDateToDay`    | `<select>` 1–31 |
| Month    | `...dtlPrevEmpl_ctl{NN}_ddlEmpDateToMonth`  | `<select>` JAN–DEC |
| Year     | `...dtlPrevEmpl_ctl{NN}_tbxEmpDateToYear`   | `<input>` maxlength=4 |

Formato: `DD-MMM-YYYY`

#### N. Briefly Describe Your Duties

| ID pattern  | `...dtlPrevEmpl_ctl{NN}_tbDescribeDuties` |
|-------------|-------------------------------------------|
| Tipo        | `<textarea>`                              |
| maxlength   | 4000                                      |
| Dimensões   | height: 65px, width: 98%                  |
| Obrigatório | Sim                                       |

---

## Controles Add/Remove da DataList

| Ação       | ID pattern                                               | Postback trigger |
|------------|----------------------------------------------------------|------------------|
| Add Another | `...dtlPrevEmpl_ctl{NN}_InsertButtonPrevEmpl`           | href (link `<a>`) — habilitado após preencher linha atual |
| Remove      | `...dtlPrevEmpl_ctl{NN}_DeleteButtonPrevEmpl`           | `__doPostBack('...dtlPrevEmpl$ctl{NN}$DeleteButtonPrevEmpl', '')` |

> **Estratégia de automação:**
> - Preencher linha índice `ctl00`; clicar "Add Another" para criar `ctl01`; repetir.
> - Após preencher todas as entradas, verificar se a última linha está vazia. Se sim, clicar "Remove" nela antes de avançar.
> - Aguardar o postback de cada Add/Remove antes de interagir com a nova linha.

---

## Seção 3 — Educational Institutions

### Campo Gate: Have you attended any educational institutions at a secondary level or above?
- ID (grupo): `ctl00_SiteContentPlaceHolder_FormView1_rblOtherEduc`
- Opções: `Y` / `N`
- Postback: Selecionar `N` dispara `__doPostBack`

### DataList: `dtlPrevEduc` (quando Y)
- Institution Name: `...dtlPrevEduc_ctl{NN}_tbxSchoolName` (Max 75)
- Address Line 1: `...dtlPrevEduc_ctl{NN}_tbxSchoolAddr1` (Max 40)
- Address Line 2: `...dtlPrevEduc_ctl{NN}_tbxSchoolAddr2` (Max 40, Optional)
- City: `...dtlPrevEduc_ctl{NN}_tbEducCity` (Max 20)
- State: `...dtlPrevEduc_ctl{NN}_tbxEDUC_INST_ADDR_STATE` (com checkbox `cbxEDUC_INST_ADDR_STATE_NA`)
- ZIP Code: `...dtlPrevEduc_ctl{NN}_tbxEDUC_INST_POSTAL_CD` (com checkbox `cbxEDUC_INST_POSTAL_CD_NA`)
- Country: `...dtlPrevEduc_ctl{NN}_ddlSchoolCountry`
- Course of Study: `...dtlPrevEduc_ctl{NN}_tbEducCourseOfStudy` (Max 66)
- Date From: `...dtlPrevEduc_ctl{NN}_ddlSchoolFromDay`, `ddlSchoolFromMonth`, `tbxSchoolFromYear`
- Date To: `...dtlPrevEduc_ctl{NN}_ddlSchoolToDay`, `ddlSchoolToMonth`, `tbxSchoolToYear`
- Add/Remove actions follows standard data list pattern with `InsertButtonPrevEduc` and `DeleteButtonPrevEduc`

## Lógica Condicional Resumida

```
rblPreviouslyEmployed → onChange
  ├── "Y" (default) → exibir ViewDivPreviouslyEmployed (dtlPrevEmpl)
  └── "N"           → __doPostBack(...rblPreviouslyEmployed$1,'')
                      → ocultar ViewDivPreviouslyEmployed
```

---

## Navegação

| Botão | ID | Ação |
|-------|----|------|
| Back  | `ctl00_SiteContentPlaceHolder_UpdateButton1` | Volta para Work/Education: Present |
| Save  | `ctl00_SiteContentPlaceHolder_UpdateButton2` | Salva sem avançar |
| Next  | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança para Work/Education: Additional |
