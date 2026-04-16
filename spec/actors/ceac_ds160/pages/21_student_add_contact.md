# 21. Additional Contact (Student/Exchange Visa)

**URL:** `https://ceac.state.gov/GenNIV/General/complete/complete_ExchangeVisitorAddContact.aspx?node=ExchangeVisitor2`
**Título CEAC:** Additional Point of Contact Information
**Nota CEAC:** "You have indicated that you will be studying in some capacity while in the United States. List at least two contacts in your country of residence who can verify the information that you have provided on this application. Do not list immediate family members or other relatives. Postal office box numbers are unacceptable."
**Navegação:** Back → Security and Background | Next → SEVIS

---

## Regras de Negócio (preservadas do stub)

- **PAGE RULE:** exibir SOMENTE SE `purposeOfTrip` ∈ `["F1-F1", "J1-J1", "M1"]`
  - O sistema do CEAC exige **no mínimo 2 contatos** obrigatórios nesta página.
  - A engine (SendS160) deve validar que o array `contacts` possui `length >= 2`.

---

## Estrutura do DataList (Contatos)

A página utiliza um componente `DataList` padrão (`ctl00_SiteContentPlaceHolder_FormView1_dtlStudentAddPOC`) para renderizar os contatos (mínimo 2). 
Todos os campos são sufixados com um índice (`ctl00`, `ctl01`, etc). O exemplo abaixo é para o índice `XX`.

### 1. Nome do Contato

| Campo | ID Padrão | Tipo / Limite | Obrigatório |
|-------|-----------|---------------|-------------|
| Surnames | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_SURNAME` | `<input text>` max 33 | Sim |
| Given Names | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_GIVEN_NAME` | `<input text>` max 33 | Sim |

### 2. Endereço do Contato

| Campo | ID Padrão | Tipo / Limite | Obrigatório |
|-------|-----------|---------------|-------------|
| Street Address (Line 1) | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_ADDR_LN1` | `<input text>` max 40 | Sim |
| Street Address (Line 2) | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_ADDR_LN2` | `<input text>` max 40 | Não (*Optional*) |
| City | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_ADDR_CITY` | `<input text>` max 20 | Sim |

**Estado/Província:**
| Opção | ID Padrão | Tipo / Ação |
|-------|-----------|-------------|
| State/Province | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_ADDR_STATE` | `<input text>` max 20 |
| Does Not Apply | `*dtlStudentAddPOC_ctlXX_cbxADD_POC_ADDR_STATE_NA` | Checkbox → **POSTBACK TRIGGER** |

**Código Postal:**
| Opção | ID Padrão | Tipo / Ação |
|-------|-----------|-------------|
| Postal Zone/ZIP Code | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_ADDR_POSTAL_CD` | `<input text>` max 10 |
| Does Not Apply | `*dtlStudentAddPOC_ctlXX_cbxADD_POC_ADDR_POSTAL_CD_NA` | Checkbox → **POSTBACK TRIGGER** |

**País/Região:**
| Campo | ID Padrão | Tipo / Limite | Obrigatório |
|-------|-----------|---------------|-------------|
| Country/Region | `*dtlStudentAddPOC_ctlXX_ddlADD_POC_ADDR_CTRY` | `<select>` (lista de países) | Sim |

### 3. Informações de Contato

**Telefone:**
| Opção | ID Padrão | Tipo / Ação |
|-------|-----------|-------------|
| Telephone Number | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_TEL` | `<input text>` min 5, max 15 |
| Does Not Apply | `*dtlStudentAddPOC_ctlXX_cbxADD_POC_TEL_NA` | Checkbox → **POSTBACK TRIGGER** |

**Email:**
| Opção | ID Padrão | Tipo / Ação |
|-------|-----------|-------------|
| Email Address | `*dtlStudentAddPOC_ctlXX_tbxADD_POC_EMAIL_ADDR` | `<input text>` max 50 |
| Does Not Apply | `*dtlStudentAddPOC_ctlXX_cbxADD_POC_EMAIL_ADDR_NA` | Checkbox → **POSTBACK TRIGGER** |

> ⚠️ As checkboxes de "Does Not Apply" disparam postbacks imediatos (`setTimeout('__doPostBack(...)', 0)`) via UpdatePanels dedicados e desabilitam o TextBox associado no servidor. A engine deve aguardar a sincronização da página após acionar essas checkboxes.

---

## Gerenciamento de Linhas (Add/Remove)

Assim como em Previous Employment, a criação de contatos extras além do inicial requer interação explícita com botões:

| Ação | ID Padrão | Dispara Postback |
|------|-----------|------------------|
| Add Another | `*dtlStudentAddPOC_ctlXX_InsertButtonAddPOC` | Sim (adiciona linha ao final) |
| Remove | `*dtlStudentAddPOC_ctlXX_DeleteButtonAddPOC` | Sim (remove a linha específica) |

> **Processo Recomendado para Engine:**
> O CEAC normalmente renderiza os 2 contatos iniciais bloqueados (sem botão Remove), ou com um layout que exige pelo menos 2 arrays preenchidos.
> O preenchimento deve seguir o índice existente no array de contexto e interagir com as flags de NA.

---

## Navegação

| Botão | ID | Ação |
|-------|----|------|
| Back  | `ctl00_SiteContentPlaceHolder_UpdateButton1` | Retorna para Security and Background |
| Save  | `ctl00_SiteContentPlaceHolder_UpdateButton2` | Salva a página atual |
| Next  | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança para SEVIS |

> **Nota Arquitetural:** Embora no Spec CAEC esta página esteja como `21_student_add_contact` e SEVIS como `20_student_exchange_sevis`, geograficamente a navegação do CEAC coloca *Additional Contact* **antes** de *SEVIS*. Ambas disparam e validam dependendo do tipo `purposeOfTrip`. A FormEngine precisa respeitar a transição `Security -> Additional Contact (se aplicável) -> SEVIS (se aplicável) -> Review`.
