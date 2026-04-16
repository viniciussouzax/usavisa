# 20. SEVIS Information (Student/Exchange Visa)

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_ExchangeVisitorStudentVisa.aspx?node=ExchangeVisitor3`
**Título CEAC:** SEVIS Information
**Nota CEAC:** "You have indicated that the purpose of your trip to the U.S. is to be a student or exchange visitor. Provide the following information regarding the institution at which you intend to study."
**Navegação:** Back → Additional Contact | Next → REVIEW

---

## Regras de Negócio (preservadas do stub)

- **PAGE RULE:** exibir SOMENTE SE `purposeCategory` ∈ `["F", "J", "M"]`
- **Program Number:** exibir SOMENTE SE `purposeOfTrip` ∈ `["J1-J1", "J2-CH", "J2-SP"]`
- **Principal SEVIS ID:** exibir SOMENTE SE `purposeOfTrip` ∈ `["F2-CH", "F2-SP", "J2-CH", "J2-SP", "M2"]`
- **School Details block:** exibir SOMENTE SE `purposeOfTrip` ∈ `["F1-F1", "J1-J1", "M1"]`

> Esta página é **condicional** — a maioria dos requerentes não a verá. A engine deve verificar `purposeCategory` do perfil antes de navegar para cá.

## Seção 1 — Study Intent
> Visível e condicional baseada na resposta: "Do you intend to study in the U.S.?"
- Radio Yes/No: `ctl00_SiteContentPlaceHolder_FormView1_rblStudyQuestion`
- Aciona PostBack para validar status e exibir SEVIS info.

---

## Seção 2 — SEVIS ID

> Sempre visível quando a página é exibida.

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSevisID` |
| Tipo        | `<input type="text">` |
| maxlength   | 11 |
| Formato     | `N0123456789` (letra N + 10 dígitos) |
| Hint        | `(e.g., N0123456789)` |
| Obrigatório | Sim |

---

## Seção 2 — School Details (F1 / J1 / M1)

> Container: `ctl00_SiteContentPlaceHolder_FormView1_ShowDiv`
> UpdatePanel: `ctl00_SiteContentPlaceHolder_FormView1_upnlSEVIS`
> Visível quando `purposeOfTrip` ∈ `["F1-F1", "J1-J1", "M1"]`

### A. Name of School

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxNameOfSchool` |
| maxlength   | 75 |
| width       | 95% |
| Obrigatório | Sim |

### B. Course of Study

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSchoolCourseOfStudy` |
| maxlength   | 66 |
| width       | 95% |
| Obrigatório | Sim |
| Help        | Para high school: "Academic" ou "Vocational". Para outros níveis: indicar a especialização/major. |

### C. Street Address (Line 1)

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSchoolStreetAddress1` |
| maxlength   | 40 |
| width       | 95% |
| Obrigatório | Sim |

### D. Street Address (Line 2)

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSchoolStreetAddress2` |
| maxlength   | 40 |
| width       | 95% |
| Obrigatório | Não (*Optional*) |

### E. City

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSchoolCity` |
| maxlength   | 20 |
| Obrigatório | Sim |

### F. State

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_ddlSchoolState` |
| Tipo        | `<select>` — estados dos EUA (AL → WY) + territórios |
| Obrigatório | Sim |

**Valores disponíveis (abreviações):** AL, AK, AS, AZ, AR, CA, CO, CT, DE, DC, FL, GA, GU, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, MP, OH, OK, OR, PA, PR, RI, SC, SD, TN, TX, UT, VT, VI, VA, WA, WV, WI, WY

### G. Postal Zone / ZIP Code

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxSchoolZIPCode` |
| maxlength   | 10 |
| Formato     | `12345` ou `12345-1234` |
| Hint        | `(e.g., 12345 or 12345-1234)` |
| Obrigatório | Sim |

---

## Seção 3 — Program Number (J1 / J2 apenas)

> Visível quando `purposeOfTrip` ∈ `["J1-J1", "J2-CH", "J2-SP"]`

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxProgram` |
| Tipo        | `<input type="text">` |
| Obrigatório | Sim (quando visível) |

---

## Seção 4 — Principal SEVIS ID (F2 / J2 / M2)

> Visível quando `purposeOfTrip` ∈ `["F2-CH", "F2-SP", "J2-CH", "J2-SP", "M2"]`
> Requerentes F2/J2/M2 são dependentes — informam o SEVIS ID do titular (F1/J1/M1).

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxPrincipalSevisID` |
| maxlength   | 11 |
| Formato     | `N0123456789` |
| Obrigatório | Sim (quando visível) |

---

## Lógica Condicional Resumida

```
purposeCategory
  ├── "F" / "J" / "M" → exibir página
  └── outros            → SKIP (não navegar para esta página)

purposeOfTrip
  ├── "F1-F1" / "J1-J1" / "M1"
  │     └── exibir Seção 2 (School Details) dentro de ShowDiv
  ├── "J1-J1" / "J2-CH" / "J2-SP"
  │     └── exibir Seção 3 (Program Number)
  └── "F2-CH" / "F2-SP" / "J2-CH" / "J2-SP" / "M2"
        └── exibir Seção 4 (Principal SEVIS ID)
```

---

## Navegação

| Botão | ID | Ação |
|-------|----|------|
| Back  | `ctl00_SiteContentPlaceHolder_UpdateButton1` | Volta para Additional Contact |
| Save  | `ctl00_SiteContentPlaceHolder_UpdateButton2` | Salva sem avançar |
| Next  | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança para REVIEW |

> **Atenção:** O botão Next desta página leva direto para **REVIEW**, não para outra seção de coleta. Isso significa que, para vistos F/J/M, esta é a última página de dados antes da revisão final.
