# 1. Landing / Apply (Default.aspx)

## URL
`https://ceac.state.gov/GenNIV/Default.aspx`

## Page Elements

### Language Selection
- **ID Pattern:** `ctl00_SiteContentPlaceHolder_ucCultures_gridLanguages_{id}_btnLanguage`
- **Action:** Syncs culture via `syncLanguageSelections2('{culture}','ctl00_ddlLanguage')` then triggers `WebForm_DoPostBackWithOptions()`.

### Location Section 
- **Label:** "Select a location where you will be applying for this visa"
- **Select ID:** `ctl00_SiteContentPlaceHolder_ucLocation_ddlLocation`
- **Action:** Contains JavaScript `onchange="syncLocationToCulture(...);setTimeout('__doPostBack(...)',0)"`. Selecting ANY option triggers a synchronous PostBack.
- **Rules:** Location value maps directly to required Embassy rules. Selecting specific locations (like "PTA", "RCF") triggers specific "Additional Location Information" Modals.

### Captcha Section
- **Captcha Image Control ID:** `c_default_ctl00_sitecontentplaceholder_uclocation_identifycaptcha1_defaultcaptcha`
- **Captcha Input ID:** `ctl00_SiteContentPlaceHolder_ucLocation_IdentifyCaptcha1_txtCodeTextBox`
- **Validation:** `maxlength="10"`, `aria-required="true"`

## Actions / Buttons

### Start An Application
- **ID:** `ctl00_SiteContentPlaceHolder_lnkNew`
- **State:** Disabled initially (`disabled="disabled"`). Enabled via server-logic after Location is selected and valid elements generated.
- **Target Navigation:** Leads to `SecurityQuestion` page upon success.

### Retrieve An Application
- **ID:** `ctl00_SiteContentPlaceHolder_lnkRetrieve`
- **Action:** Triggers `WebForm_DoPostBackWithOptions`. Navigates to Recovery Flow.

## Modals & Popups

### Additional Location Information
- **Container ID:** `ctl00_SiteContentPlaceHolder_ucPostMessage_ucPost_pnlMessage`
- **Trigger:** Server-side postback based on location (`ddlLocation`).
- **Close Button ID:** `ctl00_SiteContentPlaceHolder_ucPostMessage_ucPost_ctl01_lnkClose` (Triggers postback to close modal).

### Browser Requirements
- **Container ID:** `ctl00_SiteContentPlaceHolder_ucBrowserReqs_pnlMessage`
- **Close Button ID:** `ctl00_SiteContentPlaceHolder_ucBrowserReqs_ctl01_lnkClose` (Triggers postback).

---

## Comportamentos Críticos para a Engine

### BC-1: Perda de Valor do Location Após Postback
Após selecionar o location e aguardar o postback, o CEAC pode **silenciosamente redefinir o dropdown para o valor padrão**. A engine deve:
1. Ler o valor atual com `inputValue()` após o postback.
2. Comparar com o valor enviado.
3. Se divergir — re-selecionar e aguardar novo postback antes de prosseguir.

### BC-2: Modal Pode Reaparecer Entre CAPTCHA e Clique no Start
O modal `.modalBackground` pode reaparecer **após** a resolução do CAPTCHA e **antes** do clique no Start/Retrieve. A engine deve executar uma verificação de presença do modal imediatamente antes de clicar, verificando:
- `.modalBackground` visível com dimensões > 0

Se presente, deve ocultar via DOM antes de clicar — clicar com modal ativo intercepta o evento.

### BC-3: Validação de Navegação Pós-Clique
Após clicar em Start ou Retrieve, a engine valida o sucesso **pela URL resultante**:

| Cenário | URL Contém | Ação |
|---|---|---|
| Sucesso — Start | `SecureQuestion` ou `ConfirmApplicationID` ou `complete_` | Continuar |
| Sucesso — Retrieve | URL saiu de `Default.aspx` sem erros | Continuar |
| Sessão expirada | `SessionTimedOut` ou `TimedOut` | Falha → causa `session_expired` |
| Ainda na landing | `Default.aspx` mantido | Falha → verificar ValidationSummary |

### BC-4: ValidationSummary — Classificação de Erros na Landing
Após falha no clique de Start/Retrieve, ler o conteúdo de `[id*="ValidationSummary"]` e classificar:

| Padrão no texto | Causa Canônica |
|---|---|
| `/location.*not.*completed/i` | `validation_error` (location não confirmado pelo servidor) |
| `/characters.*do not match\|captcha\|verification/i` | `captcha_failed` |
| Outros | `validation_error` genérico |

---

## Fluxo Retrieve — Campos Adicionais na Landing

Quando `useRetrieve = true`, a landing exibe campos extras para identificação. Todos são condicionais — verificar visibilidade antes de preencher:

| Campo | Seletor | Valor Esperado |
|---|---|---|
| Application ID | `input[id$='_tbxApplicationID']` | `application.application_id` |
| Mês de segurança | `select[id$='_ddlMonth']` | `config.security_month` |
| Dia de segurança | `select[id$='_ddlDay']` | `config.security_day` |
| Ano de segurança | `input[id$='_txtYear']` ou `input[id$='_tbxYear']` | `config.security_year` |
| Resposta de segurança | `input[id$='_txtAnswer']` | `config.security_answer` |
| Sobrenome (5 chars) | `input[id$='_txbSurname']` | Primeiros 5 caracteres do sobrenome, **maiúsculo** |
| Ano de nascimento | `input[id$='_txbDOBYear']` | `profile.dob.year` |

> **Nota:** O campo de sobrenome exige exatamente os **primeiros 5 caracteres em maiúsculo**. Se o sobrenome tiver menos de 5 caracteres, usar o sobrenome completo em maiúsculo.
