# 24. Sign and Submit

**URL:** `https://ceac.state.gov/GenNIV/General/esign/signtheapplication.aspx?node=SignCertify`
**Título CEAC:** Sign and Submit
**Navegação Final:** Botão de envio altera de "Next" para "Sign and Submit Application" e posteriormente um novo "Next: Confirmation".

---

## Passo 1: Informações de Preparador (Preparer of Application)

No final da página de Termos e Juramentos, a seção *Preparer of Application* pergunta se houve assistência na requisição.

| Propriedade | Valor |
|-------------|-------|
| Pergunta    | Did anyone assist you in filling out this application? |
| ID (Yes)    | `ctl00_SiteContentPlaceHolder_FormView3_rblPREP_IND_0` |
| ID (No)     | `ctl00_SiteContentPlaceHolder_FormView3_rblPREP_IND_1` |
| Tipo        | `<input type="radio">` (`name="...$rblPREP_IND"`) |
| Regra (Yes) | Dispara postback (`__doPostBack`)! |

> **Nota para Engine:** Se for assinalado "Yes", o sistema retornará a página expandida com os campos de detalhes do Preparador (Nome, Organização, Endereço). Como é um Postback imediato via `onClick="javascript:setTimeout('__doPostBack(...)', 0)"`, a automação DEVE lidar com a transição síncrona/espera do refresh antes de preencher os campos expandidos do Preparador. O dump não mostrou os campos visíveis, mas o padrão CEAC mantém a lógica de `ShowHideDiv` / painéis acionados no servidor.

---

## Passo 2: E-Signature

A assinatura eletrônica exige comprovação (número do passaporte) e validação visual de robótica.

### 2.1 Passaporte
| Propriedade      | Valor |
|------------------|-------|
| ID               | `ctl00_SiteContentPlaceHolder_PPTNumTbx` |
| Rótulo           | Enter your Passport/Travel Document Number |
| Tipo / maxlength | `<input type="text">` | max 20 |

### 2.2 Verificação Captcha (BotDetect)
| Propriedade      | Valor |
|------------------|-------|
| ID               | `ctl00_SiteContentPlaceHolder_CodeTextBox` |
| Rótulo           | Enter the code as shown |
| Tipo / maxlength | `<input type="text">` | max 10 |

> **Painel do Captcha:**
Uma imagem gerada por `/GenNIV/BotDetectCaptcha.ashx?...` é exibida no div `#c_general_esign_signtheapplication_...`. 
A engine de automação DEVE resolver o captcha desta imagem via solver para este input ser preenchido antes do submit final.

---

## Passo 3: Finalizar e Assinar

O envio do processo real à base de dados do CEAC!

| Botão | ID / Class | Ação |
|-------|------------|------|
| Sign and Submit Application | `ctl00_SiteContentPlaceHolder_btnSignApp` | Dispara validação final da aplicação assinada e travamento formal do registro. (É irreversível após isso). |

---

## Passo 4: Transição de Sucesso (Pós-Assinatura)

- Ao recarregar a visualização após o envio com sucesso do `btnSignApp`, o painel `#ctl00_SiteContentPlaceHolder_Hide_Show3` apresenta a mensagem:
> *"You have successfully signed and submitted your application. You cannot make any changes to your application at this point. Please click ‘Next: Confirmation’ to complete the application process."*

| Botão | ID | Ação |
|-------|----|------|
| Next: Confirmation | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Habilitado após a assinatura. Ao rodar o form/click, este botão encarrega de ir para a página de baixar Confirmação. |

> **⚠️ Nota Crítica para Engine:** O `UpdateButton3` é renderizado com `disabled="disabled"` no HTML inicial. Ele **só é habilitado pelo servidor** após confirmar que `btnSignApp` foi processado com sucesso. A engine deve aguardar a remoção do atributo `disabled` antes de clicar — nunca forçar a remoção programática do atributo via JavaScript, pois isso contorna a confirmação do servidor e pode resultar em navegação sem registro válido.

---

## Passo 5: Tratamento de Erros de Validação Pós-Assinatura

Se o servidor rejeitar a assinatura (ex: passaporte inválido, CAPTCHA incorreto), o CEAC injeta um sumário de erros na DOM **sem redirecionar**. A engine deve verificar a presença desse elemento antes de aguardar o `UpdateButton3`:

| Elemento | ID / Seletor | Conteúdo |
|---|---|---|
| Sumário de Validação | `div[id$='_ValidationSummary1']` | Lista de erros textuais retornados pelo governo |

Se o sumário estiver visível e com conteúdo, a falha deve ser classificada como `validation_error` com a mensagem literal do governo extraída do elemento.
