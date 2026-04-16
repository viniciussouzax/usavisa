# 3. Security Question Setup

## URL
`https://ceac.state.gov/GenNIV/Common/ConfirmApplicationID.aspx?node=SecureQuestion`

## Page Elements

### Computer Fraud and Abuse Act Notices
- **Privacy Act Checkbox ID:** `ctl00_SiteContentPlaceHolder_chkbxPrivacyAct`
- **Action:** `onclick="javascript:setTimeout('__doPostBack(\'ctl00$SiteContentPlaceHolder$chkbxPrivacyAct\',\'\')', 0)"`
- **Rule:** This Postback is REQUIRED to enable the Security Question dropdown and Continue button below. It must be executed.

### Application Information
- **Application ID Label ID:** `ctl00_SiteContentPlaceHolder_lblBarcode`
- **Extraction Rule:** The DOM element contains the absolute `AA00XXXXXX` format ID. This is the moment the Automation Engine **must save the App ID** for recovery logic.
- **Date Label ID:** `ctl00_SiteContentPlaceHolder_lblDate`

### Security Question Setup
- **Question Select ID:** `ctl00_SiteContentPlaceHolder_ddlQuestions` 
- **Pre-condition:** Disabled by default until Privacy Act is checked. Contains 20 options (Values `1` through `20`).
- **Answer Input ID:** `ctl00_SiteContentPlaceHolder_txtAnswer`
- **Validation:** `maxlength="50"`

## Actions / Buttons

### Continue Workflow
- **Continue Button ID:** `ctl00_SiteContentPlaceHolder_btnContinue` 
- **State:** Disabled initially. Enabled by the Postback triggered upon checking the Privacy Act checkbox.

### Cancel
- **Cancel Button ID:** `ctl00_SiteContentPlaceHolder_btnContinueApp` 
- **Action:** Triggers Postback `WebForm_DoPostBackWithOptions` to abort Application ID generation and return.

---

## Comportamentos Críticos para a Engine

### BC-1: Privacy Act Checkbox Dispara Postback Obrigatório
O checkbox `chkbxPrivacyAct` não é apenas uma marcação UI — ele dispara um **postback ASP.NET** que habilita o dropdown de Security Question e o botão Continue. A engine deve aguardar o postback completar antes de tentar interagir com os campos seguintes.

### BC-2: Security Question Selecionado por Índice (não por valor/label)
O campo `ddlQuestions` deve ser selecionado pelo **índice numérico** da opção (ex: `{ index: 3 }`). Não usar valor textual ou `value` do `<option>`.

O dropdown pode estar **disabled** se a sessão já tinha uma pergunta configurada. Verificar `disabled` antes de tentar selecionar. O campo de resposta (`txtAnswer`) pode ser preenchível mesmo quando o dropdown está disabled — verificar os dois campos independentemente.

### BC-3: Formato Canônico do Application ID
O Application ID gerado pelo CEAC segue o padrão exato:

```
AA[0-9A-Z]{8}
```

Exemplos válidos: `AA00FEIPFF`, `AA01XY3Z9K`

- Sempre iniciar com `AA`
- Seguido de exatamente 8 caracteres alfanuméricos maiúsculos
- A engine deve extrair via regex `\bAA[0-9A-Z]{8}\b` — não confiar em posicionamento de texto

### BC-4: Application ID — Dois Locais de Captura em Prioridade
O App ID pode aparecer em dois elementos diferentes na página:

| Prioridade | Seletor | Tipo |
|---|---|---|
| 1 (preferencial) | `span[id$='_lblAppID']` | Elemento dedicado |
| 2 (fallback) | `<b>` (primeiro elemento bold) | Texto genérico em bold |

> **Regra:** Sempre tentar o seletor dedicado primeiro. O fallback para `<b>` existe porque o CEAC historicamente exibiu o ID em destaque bold sem um ID de elemento fixo.

### BC-5: Página de "Confirm Application ID" é uma Segunda Tela
Após submeter o Security Question, o CEAC navega para uma **segunda tela de confirmação** com o App ID exibido. Nessa página:
- Ler e salvar o App ID **antes** de clicar Continue
- Botão Continue: `input[id$='_btnContinueApp']`
- Aguardar mudança de URL após o clique

### BC-6: Hierarquia de Botões de Submit
O botão de prosseguir nessa página pode ter IDs diferentes. A engine deve tentar na ordem:

1. `input[id$='_btnContinue']:not([disabled])` — botão canônico da página
2. `input[type='submit'][value*='Next']:not([disabled])` — variante por texto
3. `input[type='submit']:not([disabled])` — qualquer submit habilitado
