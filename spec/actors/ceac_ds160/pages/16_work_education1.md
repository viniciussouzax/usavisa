# 16. Work/Education 1 (Present)

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_workeducation1.aspx?node=WorkEducation1`
**Título CEAC:** Present Work/Education/Training Information
**Navegação:** Back → Family | Next → Work/Education: Previous

---

## Regras de Negócio (preservadas do stub)

- RULE: if occupation == `"O"` (Other) → ACTION: show `otherOccupation`
- RULE: if occupation NOT IN `["RT", "H", "N"]` (Retired, Homemaker, Not Employed) → ACTION: show bloco `ShowDivEmployed` (Employer/School Name, Address, Salary, Duties)

---

## Campos

### 1. Primary Occupation

| Propriedade   | Valor                                                              |
|---------------|--------------------------------------------------------------------|
| ID            | `ctl00_SiteContentPlaceHolder_FormView1_ddlPresentOccupation`     |
| Tipo          | `<select>`                                                         |
| Postback      | `__doPostBack('ctl00$SiteContentPlaceHolder$FormView1$ddlPresentOccupation', '')` — executa após `ddlPresentOccupationClicked()` |
| Obrigatório   | Sim                                                                |
| Div container | `ctl00_SiteContentPlaceHolder_FormView1_showNotNAFTA`             |

**Opções (value → label):**

| value | label                  |
|-------|------------------------|
| `A`   | AGRICULTURE            |
| `AP`  | ARTIST/PERFORMER       |
| `B`   | BUSINESS               |
| `CM`  | COMMUNICATIONS         |
| `CS`  | COMPUTER SCIENCE       |
| `C`   | CULINARY/FOOD SERVICES |
| `ED`  | EDUCATION              |
| `EN`  | ENGINEERING            |
| `G`   | GOVERNMENT             |
| `H`   | HOMEMAKER              |
| `LP`  | LEGAL PROFESSION       |
| `MH`  | MEDICAL/HEALTH         |
| `M`   | MILITARY               |
| `NS`  | NATURAL SCIENCE        |
| `N`   | NOT EMPLOYED           |
| `PS`  | PHYSICAL SCIENCES      |
| `RV`  | RELIGIOUS VOCATION     |
| `R`   | RESEARCH               |
| `RT`  | RETIRED                |
| `SS`  | SOCIAL SCIENCE         |
| `S`   | STUDENT                |
| `O`   | OTHER                  |

**Lógica de postback:** A seleção dispara `__doPostBack` que recarrega o formulário mostrando/ocultando o bloco `ShowDivEmployed`. Ocupações `RT`, `H`, `N` ocultam o bloco. Qualquer outra opção o exibe.

#### 1.5. Other Occupation Explanation
> Visível quando Occupation == `"O"`
- ID: `ctl00_SiteContentPlaceHolder_FormView1_tbxOtherOccupation`
- Tipo: `<input type="text">` | Obrigatório | MaxLength: 60

---

### Bloco Condicional: `ShowDivEmployed`

> Visível quando occupation NOT IN `["RT", "H", "N"]`

#### 2. Present Employer or School Name

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchName`            |
| Tipo        | `<input type="text">`                                              |
| maxlength   | 75                                                                 |
| Obrigatório | Sim (quando bloco visível)                                         |

#### 3. Street Address (Line 1)

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr1`           |
| Tipo        | `<input type="text">`                                              |
| maxlength   | 40                                                                 |
| Obrigatório | Sim                                                                |

#### 4. Street Address (Line 2)

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchAddr2`           |
| Tipo        | `<input type="text">`                                              |
| maxlength   | 40                                                                 |
| Obrigatório | Não (*Optional*)                                                   |

#### 5. City

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmpSchCity`            |
| Tipo        | `<input type="text">`                                              |
| maxlength   | 20                                                                 |
| Obrigatório | Sim                                                                |

#### 6. State/Province

| Propriedade       | Valor                                                                      |
|-------------------|----------------------------------------------------------------------------|
| ID (texto)        | `ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_STATE`          |
| ID (N/A hidden)   | `ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_STATE_NA`       |
| ID (checkbox N/A) | `ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_STATE_NA`       |
| Tipo              | `<input type="text">` + checkbox "Does Not Apply"                          |
| maxlength         | 20                                                                         |
| Obrigatório       | Sim (ou marcar "Does Not Apply")                                           |
| JS checkbox       | `enableTbx('...tbxWORK_EDUC_ADDR_STATE', '...tbxWORK_EDUC_ADDR_STATE_NA')` |

#### 7. Postal Zone / ZIP Code

| Propriedade       | Valor                                                                           |
|-------------------|---------------------------------------------------------------------------------|
| ID (texto)        | `ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_POSTAL_CD`           |
| ID (N/A hidden)   | `ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_ADDR_POSTAL_CD_NA`        |
| ID (checkbox N/A) | `ctl00_SiteContentPlaceHolder_FormView1_cbxWORK_EDUC_ADDR_POSTAL_CD_NA`        |
| Tipo              | `<input type="text">` + checkbox "Does Not Apply"                               |
| maxlength         | 10                                                                              |
| Obrigatório       | Sim (ou marcar "Does Not Apply")                                                |
| JS checkbox       | `enableTbx('...tbxWORK_EDUC_ADDR_POSTAL_CD', '...tbxWORK_EDUC_ADDR_POSTAL_CD_NA')` |

#### 8. Phone Number

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxWORK_EDUC_TEL`        |
| Tipo        | `<input type="text">`                                              |
| maxlength   | 15                                                                 |
| minlength   | 5                                                                  |
| Obrigatório | Sim                                                                |

#### 9. Country/Region

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_ddlEmpSchCountry`        |
| Tipo        | `<select>` (lista completa de países CEAC)                         |
| Obrigatório | Sim                                                                |

#### 10. Start Date

Composto por 3 elementos:

| Elemento | ID                                                                        | Tipo             |
|----------|---------------------------------------------------------------------------|------------------|
| Day      | `ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromDay`               | `<select>` 1–31  |
| Month    | `ctl00_SiteContentPlaceHolder_FormView1_ddlEmpDateFromMonth`             | `<select>` JAN–DEC |
| Year     | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmpDateFromYear`              | `<input>` maxlength=4 |

Formato esperado: `DD-MMM-YYYY`

#### 11. Monthly Income in Local Currency

| Propriedade       | Valor                                                                           |
|-------------------|---------------------------------------------------------------------------------|
| ID (texto)        | `ctl00_SiteContentPlaceHolder_FormView1_tbxCURR_MONTHLY_SALARY`               |
| ID (N/A hidden)   | `ctl00_SiteContentPlaceHolder_FormView1_tbxCURR_MONTHLY_SALARY_NA`            |
| ID (checkbox N/A) | `ctl00_SiteContentPlaceHolder_FormView1_cbxCURR_MONTHLY_SALARY_NA`            |
| maxlength         | 15                                                                              |
| Obrigatório       | Sim (ou marcar "Does Not Apply")                                                |
| JS checkbox       | `enableTbx('...tbxCURR_MONTHLY_SALARY', '...tbxCURR_MONTHLY_SALARY_NA')`      |

#### 12. Briefly Describe Your Duties

| Propriedade | Valor                                                              |
|-------------|--------------------------------------------------------------------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxDescribeDuties`       |
| Tipo        | `<textarea>`                                                       |
| maxlength   | 4000                                                               |
| Dimensões   | rows=2, cols=20, style: height 65px × width 300px                 |
| Obrigatório | Sim                                                                |

---

## Lógica Condicional Resumida

```
ddlPresentOccupation → onChange → ddlPresentOccupationClicked() → __doPostBack(...)
  ├── value IN ["RT", "H", "N"] → ocultar ShowDivEmployed
  └── value NOT IN ["RT", "H", "N"] → exibir ShowDivEmployed
        └── [todos os campos 2–12 ficam ativos e obrigatórios]
```

---

## Campo Oculto de Controle de Página

| ID | Tipo | Uso |
|----|------|-----|
| `ctl00_SiteContentPlaceHolder_FormView1_HiddenPageChanged` | hidden (text="POChanged") | Detecta mudança de ocupação para reprocessamento server-side |

---

## Navegação

| Botão   | ID                                              | Ação                              |
|---------|-------------------------------------------------|-----------------------------------|
| Back    | `ctl00_SiteContentPlaceHolder_UpdateButton1`   | Volta para Family                 |
| Save    | `ctl00_SiteContentPlaceHolder_UpdateButton2`   | Salva sem avançar                 |
| Next    | `ctl00_SiteContentPlaceHolder_UpdateButton3`   | Avança para Work/Education: Previous |
