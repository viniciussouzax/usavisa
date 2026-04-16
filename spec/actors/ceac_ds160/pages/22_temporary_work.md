# 22. Temporary Work Visa Information

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_temporarywork.aspx?node=TemporaryWork`
**Título CEAC:** Temporary Work Visa Information
**Nota CEAC:** "You have indicated that the purpose of your trip to the U.S. is to work temporarily. Provide the following information concerning your employer."
**Navegação:** Back → Security and Background | Next → REVIEW

---

## Regras de Negócio (preservadas do stub)

- **PAGE RULE:** exibir SOMENTE SE `purposeCategory` ∈ `["H", "L", "O", "P", "Q", "R"]`

> Esta página coleta os dados da petição de trabalho (ex: I-129) e do empregador norte-americano. É uma página condicional para vistos temporários baseados em emprego.

---

## Seção 1 — Informações da Petição

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxPetitionNumber` |
| Rótulo      | Application Receipt/Petition Number |
| Tipo        | `<input type="text">` |
| maxlength   | 13 |
| Hint        | `(e.g., ABC1234567890)` |
| Obrigatório | Sim |

| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxNameOfPetitioner` |
| Rótulo      | Name of Person/Company who Filed Petition |
| Tipo        | `<input type="text">` |
| maxlength   | 66 |
| Obrigatório | Sim |

---

## Seção 2 — Empregador ("Where Do You Intend to Work?")

### A. Name of Employer
| Propriedade | Valor |
|-------------|-------|
| ID          | `ctl00_SiteContentPlaceHolder_FormView1_tbxEmployerName` |
| maxlength   | 75 |
| Obrigatório | Sim |

### B. Endereço nos EUA
| Campo | ID Padrão | Limite / Tipo | Obrigatório |
|-------|-----------|---------------|-------------|
| U.S. Street Address (Line 1) | `..._FormView1_tbxEmpStreetAddress1` | max 40 | Sim |
| U.S. Street Address (Line 2) | `..._FormView1_tbxEmpStreetAddress2` | max 40 | Não (*Optional*) |
| City                         | `..._FormView1_tbxEmpCity`           | max 20 | Sim |
| State                        | `..._FormView1_ddlEmpState`          | `<select>` | Sim (dropdown padrão EUA) |
| ZIP Code                     | `..._FormView1_tbxZIPCode`           | max 10 | Não (*if known*) |

### C. Contato & Remuneração
| Campo | ID Padrão | Limite / Tipo | Obrigatório |
|-------|-----------|---------------|-------------|
| Phone Number | `..._FormView1_tbxTEMP_WORK_TEL` | min 5, max 15 | Sim |
| Monthly income (in USD) | `..._FormView1_tbxEmpSalaryInUSD` | max 11 (número) | Sim |

> ⚠️ Nota: O campo `tbxEmpSalaryInUSD` aparece dentro de uma tag iterativa genérica (`HideDiv`), podendo sua obrigatoriedade variar dependendo da subclasse específica (ex: O1 exige, outros talvez não). A FormEngine deve prever tratar como opcional se o nó condicional no CEAC estiver invisível na renderização online.

---

## Navegação

| Botão | ID | Ação |
|-------|----|------|
| Back  | `ctl00_SiteContentPlaceHolder_UpdateButton1` | Retorna para Security and Background |
| Save  | `ctl00_SiteContentPlaceHolder_UpdateButton2` | Salva sem avançar |
| Next  | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança para REVIEW |

> **Processo Recomendado para Engine:**
> Assim como as páginas de Estudante (F/J/M), para requerentes de classes H, L, O, P, Q e R, **esta pode ser a última página de coleta de dados** antes da Transição para a Revisão (REVIEW).
