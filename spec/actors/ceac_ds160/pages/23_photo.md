# 23. Photo Upload

**URL:** `https://ceac.state.gov/GenNIV/General/photo/photo_uploadthephoto.aspx?node=UploadPhoto`
**Página de Origem CEAC:** Upload Photo (Step 1) e Identix Upload (Step 2)
**Navegação:** Back → COMPLETE | Next → Confirm Photo

---

## Passo 1: Iniciar o Upload da Foto

Esta é a página introdutória de foto do CEAC (`photo_uploadthephoto.aspx`).

### Ações e Navegação
- Botão "Upload Your Photo"  (ID: `ctl00_SiteContentPlaceHolder_btnUploadPhoto` | class: `uploadphoto`)
- Ao clicar neste botão, o CEAC redireciona (ou abre em um modal/nova aba dependendo do navegador) a URL hospedada pelo subdomínio `identix.state.gov`.

> **Engine Note:** A requisição para "Upload Your Photo" gerará uma URL com uma query dinâmica no formato `https://identix.state.gov/qotw/Upload.aspx?{token_de_sessão}`. A automação deve capturar e navegar para essa URL do Identix.

---

## Passo 2: O Formulário Identix (Upload Real)

**URL:** `https://identix.state.gov/qotw/Upload.aspx?...`

Esta página contém o `<input type="file">` onde a foto é fisicamente processada para a sessão atual. É um form separado com `multipart/form-data`.

### Mapeamento dos Inputs (Identix)

| Rótulo | ID Padrão | Tipo | Ação / Obrigatório |
|--------|-----------|------|--------------------|
| Photo  | `ctl00_cphMain_imageFileUpload` | `<input type="file">` | Obrigatório. Aceita apenas `.jpg` menor que 240 KB. |

### Navegação de Submissão

| Botão | ID / Name | Ação |
|-------|-----------|------|
| Upload Selected Photo | `ctl00_cphButtons_btnUpload` | Envia o multipart/form-data. (Tipo image: `<input type="image">`) |

> **Engine Note:** Uma vez feito o upload, o Identix rodará um algoritmo próprio de verificação (Validation / Cropping Tool interna). Se o CEAC aprovar a foto submetida, o navegador renderizará uma resposta que encaminha o usuário de volta ao CEAC para a tela "Confirm Photo" da aplicação matriz.
> Se a API ou requisição direta (`POST` multipart) for utilizada pela FormEngine, deve-se lidar com os tokens do `__VIEWSTATE` específicos deste sub-domínio.

---

## Passo 3: Retorno e Confirmação (Step 3 do fluxo)

Após a certificação de que a foto está OK, o usuário volta à aplicação sob a etapa cujo botão diz `Next: Confirm Photo` ou visualiza a foto aceita no painel.

- A automação, detectando sucesso, deve prosseguir acionando o respectivo botão de navegação.

| Botão | ID / Name | Ação |
|-------|-----------|------|
| Next: Confirm Photo | `ctl00_SiteContentPlaceHolder_UpdateButton3` | Avança o fluxo confirmando a foto para o aplicativo da aplicação. |

---
**Próxima Etapa Esperada pelo CEAC:** Revisão de todos os dados (Review).

---

## Comportamentos Críticos para a Engine

### BC-1: Upload via Popup (Nova Janela do Browser)
O botão `btnUploadPhoto` abre o formulário Identix em uma **janela popup separada** (não iframe, não modal DOM). A engine deve:
1. Interceptar o evento `page` do contexto do browser **antes** de clicar o botão.
2. Aguardar o popup carregar (`domcontentloaded`).
3. Interagir com o `input[type='file']` **dentro do popup**.
4. Clicar no botão de submit do popup: `input[type='submit'][value*='Upload']` ou `input[id*='Upload']`.
5. Fechar o popup após o upload.

> **Regra:** Nunca assumir que o popup carregou — aguardar o evento `page` com timeout configurável.

### BC-2: Confirmação de Aceitação da Foto
Após o popup ser fechado, a engine verifica se a foto foi aceita pelo CEAC:
- `input[id$='UpdateButton3']`: se `isEnabled()` retornar `true` → foto aceita → clicar Next.
- Se ainda desabilitado → upload não foi processado corretamente.

### BC-3: Fluxo de Skip (Sem Foto)
Quando não há foto disponível, a engine ativa o modal de skip via o link `#COMPLETE` e clica no botão de confirmação. Os textos dos botões têm **duas variantes documentadas** (CEAC usa hífens e em-dashes de forma inconsistente):

**Variante "Without Saving":**
- `"No - Continue Without Saving"` (hífen)
- `"No – Continue Without Saving"` (em-dash)

**Variante "Continue Form":**
- `"No - Continue Form"` (hífen)
- `"No – Continue Form"` (em-dash)

A engine deve tentar **todas as variantes** por seletor, na ordem listada acima.

### BC-4: Navegação Direta para Review via `__doPostBack`
Se o modal de skip não aparecer, a engine pode forçar a navegação para a Review via postback direto:

- **Alvo do `__doPostBack`:** `'ctl00$ucNavigateOption$ucNavPanel$ctl01$btnReviewPage'`
- **Fallback:** Clicar no link de Review: `a#REVIEW` ou `a[id*='REVIEW']` ou `a[href*='Review']`
