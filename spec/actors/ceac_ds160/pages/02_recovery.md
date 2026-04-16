# 2. Recovery (Retrieve Application)

## URL
`https://ceac.state.gov/GenNIV/Common/Recovery.aspx`

## Phase 1: Application ID & Captcha
*This phase is required to initiate the recovery request from the landing page or to identify the Application ID structure.*

- **Application ID Input:** 
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_tbxApplicationID`
  - **Validation:** `maxlength="10"`
- **Captcha Input:**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_IdentifyCaptchaLand1_txtCodeTextBox`
  - **Validation:** `maxlength="10"`
- **Retrieve Button (Phase 1):**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_btnBarcodeSubmit`
  - **Action:** Triggers `WebForm_DoPostBackWithOptions(..."BarcodeGroup"...)`

## Phase 2: Security Verification
*Once Application ID is valid, verifying applicant's identity attributes.*

- **Location Select:** 
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_ddlLocation` (Standard location codes matching `01_apply`)
- **Surname Input:**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_txbSname`
  - **Validation:** `maxlength="5"` (First 5 letters of Surname algorithmically)
- **Year of Birth Input:**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_txbYear`
  - **Validation:** `maxlength="4"` (Numeric Year 'YYYY')
- **Security Question Select:**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_ddlQuestions` (Indexes 1-20)
- **Security Answer Input:**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_txbAnswer1`
  - **Validation:** `maxlength="100"`
- **Retrieve Button (Phase 2):**
  - **ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_Button1`
  - **Action:** Triggers Postback (`AppIDSecureQuestion`)

## Modals & Exceptional States

### Archived Application Modal (Older than 30 days)
- **Container ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_pnlArchivedRequest`
- **Actions:**
  - **No Button ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_btnCancel`
  - **Yes Button ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_btnRequestSubmit`

### Previously Submitted Application Modal
- **Container ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_pnlSubmittedApp`
- **Message:** "The DS-160 application you are attempting to retrieve has been submitted."
- **Actions (Radio Buttons):**
  - **View Confirmation Page ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_radConfirmPage` (Triggers postback: `onclick="javascript:setTimeout('__doPostBack(...)', 0)"`)
  - **Create a New Application ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_radNewFromSubmitted` (Triggers postback)
- **Continue Button ID:** `ctl00_SiteContentPlaceHolder_ApplicationRecovery1_btnSubmitedConfirm`

---

## Atualização: Terceiro Sub-estado da Recovery (Phase 1 Sem CAPTCHA)

O handler legado revelou que a Recovery pode operar em **3 sub-estados**, não apenas 2. A detecção deve seguir esta ordem de prioridade:

| Prioridade | Condição de Detecção | Sub-estado | Ação |
|---|---|---|---|
| 1 | `input[id$='_txbSurname']` visível | **Phase 2** — Security Questions | Preencher campos de identidade |
| 2 | CAPTCHA visível + sem surname | **Phase 1 com CAPTCHA** | Preencher App ID + resolver CAPTCHA |
| 3 | Nenhum dos dois | **Phase 1 sem CAPTCHA** | Preencher apenas App ID |

> Documentado anteriormente apenas como `recovery_captcha` e `recovery_questions`. O terceiro estado ocorre quando a aplicação é acessada pela primeira vez sem histórico de falha.

---

## Seletores Alternativos Confirmados (Handler Legado)

### Botão Retrieve — 3 Seletores Alternativos
O CEAC usa IDs diferentes dependendo da fase e da versão da página:

```
input[id$='_btnRetrieve']
a[id$='_lnkRetrieve']
input[value*='Retrieve']
```

### Campos Phase 2 — Padrões de Sufixo Confirmados
Os seguintes padrões de sufixo foram confirmados em produção (complementam os IDs completos documentados acima):

| Campo | Padrão Sufixo | Notas |
|---|---|---|
| Sobrenome | `_txbSurname` | **Exatamente 5 chars, maiúsculo** |
| Ano de nascimento | `_txbDOBYear` | 4 dígitos numéricos |
| Mês segurança | `_ddlMonth` | Select — formato `"01"` a `"12"` |
| Dia segurança | `_ddlDay` | Select — formato `"01"` a `"31"` |
| Ano segurança | `_txtYear` ou `_tbxYear` | Dois seletores alternativos |
| Resposta segurança | `_txbAnswer` | Em minúsculo na URL de produção |

### Elemento de Erro Adicional
Além do `[id*="ValidationSummary"]`, o CEAC exibe erros de Recovery também em:
```
[id*="lblError"]
```
A engine deve verificar ambos antes de classificar a causa da falha.

## Detecção de Sucesso
A saída bem-sucedida da Recovery é confirmada pela **URL**: se a URL após o clique em Retrieve **não contiver mais `Recovery.aspx`**, o processo foi concluído com sucesso.
