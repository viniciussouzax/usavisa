# Diretrizes de Construção do Motor (Engine Guidelines)

Este documento elenca as premissas arquiteturais que **devem ser consideradas** ao projetar ou aprimorar o motor de automação. As regras a seguir descrevem as exigências biológicas do formulário governamental contornadas que o robô deve respeitar na injeção.

## 1. A Estrutura das "4 Fases" (Tratamento Crítico de PostBack)

O ecossistema original (ex: ASP.NET ViewState) força recarregamentos parciais sempre que condicionantes ativam novos fluxos de UI.

- **O que deve ser evitado:** O motor jamais deve operar de forma puramente linear (de cima para baixo), sob risco de preencher um campo de texto e, no gatilho seguinte (um clique de rádio com Postback), a tela recarregar e todo o texto ser perdido.
- **O que deve ter:** O motor de injeção precisa dividir proceduralmente a execução da página numa regra severa de **4 Fases Sequenciais**:
  - **Fase 1:** Acionar iterativamente **todos** os Elementos Sinalizados como Postback (ex: Radios e Selects sinalizados no *Schema*).
  - **Fase 2:** Acionar instâncias interativas e recursivas (botões tipo "Add Another") e aguardar os reloads paralelos do servidor.
  - **Fase 3:** Preencher Elementos de Seleção (dropdowns estáticos) que **não** disparam PostBack na UI.
  - **Fase 4:** Preencher os inputs baseados em caractere (Campos de Texto e Textareas) estritamente por último.

## 2. Emulação Manuseada de Eventos Client-Side

Nem toda injeção via Shadow DOM ou protocolo puro reflete perfeitamente no *listener* da tela de governo.

- **O que deve ter:** A automação precisa ser capaz de instigar (disparar) manualmente eventos nativos interativos (como eventos de `.change`), assegurando que a cascata de regras de validação front-end dependentes seja instanciada. Qualquer input no mapeamento que ative uma condicional exigirá esse comportamento.

## 3. Tolerância por Wildcards e Identificadores Base

Frequentemente, formulários grandes e iterativos seguem matrizes de UI comuns (ex: um questionário com 30 respostas Yes/No terminam com sufixos `_0` e `_1`).

- **O que deve ter:** O motor deve estar apto a operar não somente mapeamentos um para um (ID absoluto para Valor), mas por abstrações (Wildcards/Regex) para varreduras em massa (e.g. limpar todas as alternativas restantes para uma default predefinida como "NO" quando aplicável, sem necessidade de apontamento linha por linha).
## 4. Regras de Interface e Injeção de Dados (Payload Ingestion)

### 4.1 Tolerância Zero para Mutações (Imutabilidade de Entrada)
A Engine de preenchimento será estritamente uma executora reativa (dumb worker). 
- O Payload JSON entregue à Engine deve ser perfeitamente estruturado, rígido e sanitizado.
- **Proibido (Vício Legado):** A Engine não deve usar *fallbacks* lógicos para mascarar dados ausentes na hora da injeção.
- **Adequado:** Todo JSON deve passar por uma checagem restrita (ex: via validações estritas esquemáticas) antes da Engine ser instanciada. Se o dado está faltando, o ciclo deve falhar de antemão.

### 4.2 Sanitização Isolada do Frontend
O Governo CEAC exige formatações estritas (como datas no formato `DD-MMM-YYYY`).
- Toda a lógica de tratamentos e supressão gráfica deve ser obrigatoriamente abstraída para diretórios de utilitários isolados (`utils/sanitizers`), jamais incorporada na camada da automação.

## 5. Padrões Ágeis e Estruturais (Data Flow)

### 5.1 Desacoplamento Linear (Arquitetura Agênero)
- O motor não pode ser desenhado para assumir apenas vistos únicos (Ex: array `PAGE_BUILDERS` linear assumindo B1/B2).
- Deverá suportar roteamento condicional sob demanda. O motor resolve o JSON globalmente e injeta de forma seletiva a depender da árvore percorrida da documentação `pages/`. Módulos agnósticos.

## 6. Fatos Conhecidos sobre o DOM do CEAC (Interferências Governamentais)

Estas são características nativas e imutáveis do formulário DS-160 hospedado pelo governo americano. Não são bugs nem vícios legados — são obstáculos reais que **qualquer** nova engine enfrentará e deverá estar preparada para tratar de forma sistemática e arquitetada.

### 6.1 Bloqueador de Tooltip (Interferência de Ponteiro)
O CEAC utiliza um componente nativo do ASP.NET chamado `ToolTipManager1` que, em determinados estados da página, renderiza um elemento flutuante sobreposto (`bubble_tooltip_content`) que **bloqueia fisicamente eventos de clique** sobre outros elementos da tela.
- A engine deve ter uma estratégia sistêmica de neutralização desse overlay **antes de qualquer interação de clique** — não como fallback pontual, mas como comportamento padrão da camada de interação.

### 6.2 DataLists: 4 Manifestações do Botão "Add Another"
O CEAC não usa um padrão consistente para o botão que adiciona novas linhas às suas listas dinâmicas (DataLists). Dependendo da seção, esse botão pode aparecer de **4 formas distintas**:

| Manifestação | Característica |
|---|---|
| `InsertButton` no ID | O ID do elemento contém `InsertButton` e o nome da DataList |
| Link com texto `"Add Another"` | Texto visível do link é exatamente `"Add Another"` |
| Link com classe `.addone` | O elemento possui a classe CSS `addone` |
| `__doPostBack` no `href`/`onclick` | O link referencia a DataList via evento ASP.NET no atributo de ação |

A nova engine deve contemplar **todas as 4 manifestações** ao projetar o mecanismo de expansão de listas dinâmicas.

### 6.3 Convenção de Nomenclatura das Linhas de DataList (`_ctl_`)
Quando uma nova linha é adicionada a uma DataList via "Add Another", o ASP.NET gera automaticamente um novo bloco de inputs com um sufixo sequencial no formato `_ctl01_`, `_ctl02_`, etc.
- A engine deve **verificar a aparição desse seletor na DOM** após cada clique em "Add Another" para confirmar que o servidor processou a requisição antes de tentar preencher os novos campos — nunca assumir que o clique foi suficiente.

### 6.4 Convenção de Radio Buttons (`_0` = Yes, `_1` = No)
O DS-160 usa uma convenção consistente nos IDs dos radio buttons dicotômicos:
- Sufixo `_0` → opção **"Yes" (Y)**
- Sufixo `_1` → opção **"No" (N)**

A engine deve derivar o ID alvo do radio a partir do ID base do campo + o sufixo correspondente ao valor desejado.

### 6.5 Código de "Não Selecionado" nos Dropdowns: `SONE`
O CEAC usa o valor interno `SONE` para representar a opção padrão "— Select One —" nos campos `<select>`. A engine deve reconhecer esse valor como **campo não preenchido** e jamais tentará submetê-lo como resposta válida.

### 6.6 Convenções dos Campos de Data (Selects)
Os campos de data no DS-160 são `<select>`, não inputs de texto livres. Os valores aceitos pelo governo seguem formato fixo:
- **Dia:** String com zero-padding obrigatório — `"01"` a `"31"` (nunca `"1"` ou `1`).
- **Mês:** Abreviação em inglês — `JAN`, `FEB`, `MAR`, `APR`, `MAY`, `JUN`, `JUL`, `AUG`, `SEP`, `OCT`, `NOV`, `DEC` (nunca numérico `"1"` a `"12"`).

O payload entregue à engine pode conter datas em outros formatos. A camada de sanitização (`utils/sanitizers`) é responsável por converter para esses formatos antes da injeção.

### 6.7 IDs ASP.NET Contêm `$` — Exigem Escape em Seletores CSS
Os IDs gerados pelo ASP.NET WebForms seguem o padrão `ctl00$ContentPlaceHolder1$NomeDoField`. O caractere `$` tem significado especial em CSS e deve ser escapado como `\$` ao usar seletores baseados em ID.

### 6.8 Estratégia de Correspondência Fuzzy para Dropdowns
O CEAC não garante que o valor enviado no payload corresponda exatamente ao `value` ou ao `text` de uma opção. A engine deve resolver a seleção em cascata:

1. Valor exato (`value` do `<option>`)
2. Label exato (texto visível da opção, case-insensitive)
3. Label parcial (texto contém o valor)
4. Valor parcial (`value` contém o valor)

Se todas as etapas falharem, a falha deve ser classificada como `validation_error` e logada com as opções disponíveis para diagnóstico.

## 7. Gestão de Estado de Página (Guard Pattern)

### 7.1 Princípio do Guard (Pré-condição de Estado)
Antes de executar qualquer bloco de preenchimento numa página, a engine deve **verificar se o estado atual da página é um estado permitido** para aquela etapa. Navegar para uma URL não garante que a página chegou no estado esperado — o servidor pode ter redirecionado, a sessão pode ter expirado, ou a proteção anti-bot pode ter interceptado.

A engine nunca deve assumir destino — deve confirmar.

### 7.2 Proteção Anti-Bot de Infraestrutura (TSPD / Akamai — `challenge`)
Além do BotDetect CAPTCHA embutido nos formulários, o governo americano opera uma camada de proteção de infraestrutura (TSPD ou Akamai) que pode interceptar a sessão **antes de qualquer formulário carregar**, colocando-a num estado `challenge`.

- Este estado é **irrecuperável** — não existe ação dentro da sessão que o resolva.
- A engine deve detectar `challenge` e **falhar imediatamente** com causa `challenge_detected`, disparando o descarte de sessão (conforme `logging_rules.md` Seção 4).
- **Regra: nunca aguardar ou tentar contornar `challenge` com polling — é sessão perdida.**

### 7.3 Sub-estados Conhecidos da Landing (01_apply)
A página de entrada do DS-160 não é binária (pronta/não-pronta). Possui dois sub-estados distintos:

| Sub-estado | Significado |
|---|---|
| `landing_ready` | Página totalmente carregada — dropdowns populados, CAPTCHA visível, pronto para interação |
| `landing_partial` | Página visível mas ainda carregando — dropdowns podem estar vazios, CAPTCHA ausente |

A engine deve aguardar `landing_ready` antes de iniciar preenchimento. Interagir em `landing_partial` causará falhas silenciosas.

### 7.4 Sub-estados Conhecidos da Recovery (02_recovery)
A página de recuperação de aplicação também possui dois sub-estados funcionalmente distintos que exigem ações completamente diferentes:

| Sub-estado | Significado | Ação da Engine |
|---|---|---|
| `recovery_captcha` | Falha anterior — nova tentativa exige CAPTCHA | Resolver CAPTCHA antes de submeter |
| `recovery_questions` | Acesso normal — identidade verificada por perguntas de segurança | Responder às perguntas cadastradas no início |

A engine deve detectar o sub-estado da Recovery **antes** de tentar qualquer preenchimento — nunca assumir qual dos dois está ativo.

### 7.5 Fingerprints DOM/URL por Estado (Referência de Detecção)

Estes são os marcadores concretos e imutáveis do CEAC que identificam cada estado. São fatos do formulário governamental.

#### Estado: `landing_ready` / `landing_partial`
- **URL:** contém `Default.aspx`
- **Marcadores DOM obrigatórios:** `select[id$='_ddlLocation']` + (`a[id$='_lnkNew']` ou `a[id$='_lnkRetrieve']`)
- **Distinção `ready` vs `partial`:** presença de `img[id*='CaptchaImage']` ou `.LBD_CaptchaImage`
  - Visível → `landing_ready`
  - Ausente → `landing_partial`

#### Estado: `recovery_captcha`
- **URL:** contém `Retrieve`, `Recovery` ou `ConfirmApplicationID`
- **Marcadores DOM:** `input[id*='ApplicationID']` ou `input[id*='txtCodeTextBox']` ou `img[id*='CaptchaImage']`

#### Estado: `recovery_questions`
- **URL:** contém `Retrieve`, `Recovery` ou `SecureQuestion`
- **Marcadores DOM:** `input[id*='txbSname']` (sobrenome) e `input[id*='txbYear']` (ano de nascimento)

#### Estado: `security_question`
- **URL:** contém `SecureQuestion`
- **Marcador DOM alternativo:** `input[id$='chkbxPrivacyAct']` (checkbox do Ato de Privacidade)

#### Estado: `challenge` (TSPD / Akamai)
- **Marcadores no HTML bruto da página** (não no DOM interativo):
  - String `/TSPD/` presente no conteúdo
  - `window["loaderConfig"] = "/TSPD/?type=20"`
  - `src="/TSPD/?type=18"`
- **Marcadores DOM:** `input#ans` (campo de resposta do desafio) ou `button#jar`

### 7.6 Regra de Prioridade na Classificação de Estado
A detecção de estado deve seguir uma ordem de prioridade estrita para evitar falsos positivos:

1. **Verificar Landing primeiro** — Se a URL contém `Default.aspx` e os marcadores de landing estão presentes, classificar como landing (`ready` ou `partial`), **independentemente** de marcadores TSPD coexistirem no HTML.
2. **Verificar Challenge** — Somente se a landing não foi identificada.
3. **Verificar Recovery** — Por URL e marcadores DOM.
4. **Verificar Security Question** — Por URL ou checkbox de privacidade.
5. **`unknown`** — Se nenhum estado for identificado.

> **Motivo da prioridade:** Marcadores TSPD podem ser injetados pelo Akamai mesmo em páginas legítimas do governo como scripts passivos de monitoramento. Classificar como `challenge` antes de verificar a landing descartaria sessões válidas.


## 8. Sincronizacao com ASP.NET (Fatos de Tecnologia do CEAC)

### 8.1 A API Canonica de Verificacao de Postback
O CEAC opera sobre ASP.NET WebForms com UpdatePanels (AJAX parcial). O mecanismo nativo do framework expoe uma API JavaScript para verificar se um postback assincrono esta em andamento:

```javascript
window.Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack()
```

- Retorna `true` enquanto o servidor esta processando.
- Retorna `false` quando o servidor finalizou a resposta.

Esta e a **fonte canonica de verdade** para saber se o servidor terminou - nao timers, nao polling de rede, nao delays fixos.

### 8.2 O Postback tem Duas Fases de Conclusao Distintas

A conclusao de um postback ASP.NET **nao e atomica**. Possui duas fases sequenciais que a engine deve respeitar:

| Fase | Evento | O que significa |
|---|---|---|
| **Fase 1 - Server-side** | `get_isInAsyncPostBack()` retorna `false` | O servidor processou e enviou a resposta HTTP |
| **Fase 2 - DOM-side** | Contagem de campos visiveis estabiliza | O browser terminou de re-renderizar o HTML parcial recebido |

> **Regra critica:** A Fase 1 completar **nao garante** que a Fase 2 ocorreu. Uma engine que age imediatamente apos a Fase 1 tentara interagir com elementos que ainda nao foram inseridos na DOM pelo browser.

A engine deve aguardar **ambas as fases** antes de prosseguir com qualquer preenchimento subsequente.

### 8.3 Exclusao do `ddlLanguage` nas Heuristicas de Estabilizacao de DOM
O CEAC possui um dropdown de idioma (`ddlLanguage`) presente de forma permanente em todas as paginas. Ele **nao deve ser incluido** em heuristicas que contam campos visiveis para determinar estabilizacao pos-postback - sua presenca constante distorceria a medicao.

### 8.4 Radio e Checkbox: Visibilidade para Automacao
Os tipos `radio` e `checkbox` no CEAC podem ter `offsetParent === null` e ainda assim serem funcionalmente interagiveis. A engine deve tratar esses tipos como **sempre elegiveis para interacao**, independente do calculo de visibilidade baseado em `offsetParent`.

### 8.5 Timeouts Sao Configuraveis - Nao Hardcoded
Os valores de timeout para sincronizacao ASP.NET sao sensiveis ao ambiente de execucao (velocidade de proxy, latencia de rede, carga do servidor do governo). A nova engine deve externalizar todos os valores de timeout como **configuracao de ambiente** - nunca como constantes embutidas no codigo de sincronizacao.

## 9. Verificacao Pre-Submissao (Verification Pattern)

### 9.1 Verificacao em Duas Camadas Antes de Clicar 'Next'
Antes de submeter qualquer pagina do DS-160, a engine deve executar verificacao em duas camadas independentes:

| Camada | Momento | Metodo | Custo |
|---|---|---|---|
| **1 - Client-side** | Antes de clicar Next | Varredura DOM buscando campos visiveis vazios | Zero (sem requisicao de rede) |
| **2 - Server-side** | Apos clicar Next e servidor responder | Leitura de mensagens de erro ASP.NET na DOM | Custo de 1 postback |

Nenhuma camada substitui a outra. A Camada 1 e rapida mas nao conhece todas as regras do governo. A Camada 2 e autoritativa mas lenta - serve como confirmacao final.

### 9.2 Seletores de Erros de Validacao ASP.NET (Fatos do CEAC)
Quando a submissao de uma pagina falha, o governo injeta mensagens de erro na DOM via componentes ASP.NET:

| Tipo | Seletor |
|---|---|
| Sumario de erros (lista) | `.validation-summary-errors li` |
| Sumario alternativo | `[id*=\\alSummary\\] li` |
| Validador de campo obrigatorio | `[id*=\\RequiredFieldValidator\\]` |
| Validador abreviado | `[id*=\\fv\\]` |
| Validador de intervalo | `[id*=\\RangeValidator\\]` |

Validadores individuais so devem ser lidos quando `style.display !== 'none'` e `style.visibility !== 'hidden'` - o CEAC mant�m validadores ocultos na DOM mesmo quando validos.

### 9.3 IDs de Botoes de Sistema (Exclusoes da Verificacao)
O ASP.NET renderiza alguns botoes como `input[type='text']`. A engine nao deve classificar esses IDs como campos de dados vazios durante a verificacao client-side:

`HelpButton`, `btnWarning`, `btnRecover`, `btnCancel`, `btnClient`, `btnNextPage`  

### 9.4 Sentinels de 'Nao Selecionado' em Dropdowns
Um select do CEAC deve ser considerado **nao preenchido** quando seu valor for qualquer um dos seguintes sentinels:
- `SONE` (Select One - padrao do DS-160)
- `-1` (indice padrao nao selecionado do ASP.NET)
- String vazia `\\\\`` ou `null`/`undefined`

## 10. Regras Operacionais da Passa de Preenchimento

### 10.1 Uma Postback por Passa — Rescan Obrigatório
A engine processa campos em varreduras (passes). A regra fundamental da Fase 1 e 2 é:

- Após detectar e acionar qualquer postback (Fase 1 ou 2), a engine encerra imediatamente a passa atual e retorna `needsRescan: true`.
- A próxima passa começa do zero — todos os campos visíveis são redescobertos.
- Nunca processar dois postbacks em sequência dentro da mesma passa.

**Motivo:** O postback pode alterar a estrutura da página (mostrar/ocultar campos, alterar opções de dropdowns). Qualquer campo preenchido na mesma passa após o postback pode ser invalidado ou sobrescrito pelo re-render do servidor.

### 10.2 Limite de Segurança de Passes (maxPasses)
A engine deve ter um limite máximo de passes por página para prevenir loops infinitos em páginas com muitas condicionais:

- **Padrão recomendado:** `maxPasses = 10`
- Se o limite for atingido sem que `needsRescan` vire `false`, a engine deve registrar a situação como `dom_mismatch` e interromper.

### 10.3 Campos de Texto Críticos — Disparo de Blur Nativo
Campos de texto que ativam validadores ASP.NET no evento `blur` devem ser preenchidos via chamada nativa ao Playwright (que simula interação real, dispara blur/change). Os campos críticos são identificados pelo padrão de ID:

`/Address|Street|City|Phone|Payer|Employer|Salary|Income|Occupation/`

Campos que não correspondem a esse padrão podem ser injetados em batch (avaliação direta via `evaluate`), que é significativamente mais rápido.

### 10.4 Limpeza de Linhas Vazias em DataLists (Pré-Submissão)
O CEAC auto-cria linhas vazias em DataLists durante a interação. Antes de clicar "Next", a engine deve:

1. Localizar todos os `input[type=text]` visíveis e vazios cujo ID contenha `dtl` ou `DList` (identificadores canônicos de DataList no CEAC).
2. Para cada um, subir o DOM até 15 níveis buscando:
   - Link com ID contendo `DeleteButton` ou `RemoveButton`
   - Link com texto exatamente `"Remove"` ou `"Delete"`
3. Clicar no link de remoção encontrado e aguardar o postback de confirmação.

Se nenhum botão de remoção for encontrado após 15 níveis, ignorar a linha.

## 11. Correcao � Recovery Tem 3 Sub-estados (nao 2)
A secao 7.4 documentou 2 sub-estados da Recovery. O handler legado revela um TERCEIRO sub-estado:

| Prioridade | Condicao | Sub-estado | Acao |
|---|---|---|---|
| 1 | `input[id$`='_txbSurname']` visivel | Phase 2 � Security Questions | Preencher campos de identidade |
| 2 | Captcha visivel + sem surname | Phase 1 com CAPTCHA | App ID + resolver CAPTCHA |
| 3 | Nenhum dos dois | Phase 1 sem CAPTCHA | Apenas App ID |

Atualize a implementacao de deteccao de estado para considerar os 3 casos.

## 12. Excecao de Formato de Data � Travel Page
A pagina Travel (complete_travel.aspx) e uma EXCECAO DOCUMENTADA a regra geral de datas da Secao 6.6.

- **Regra geral (demais paginas):** Datas usam valores zero-padded (ex: '01', '12') ou abreviacoes (JAN, FEB)
- **Excecao Travel:** Os selects de dia e mes usam valores numericos SEM zero-padding: '1' a '12' para meses, '1' a '31' para dias

A engine deve aplicar conversao especifica para essa pagina antes de selecionar valores nos campos ddlARRIVAL_US_DTEDay, ddlARRIVAL_US_DTEMonth, ddlTRAVEL_DTEDay, ddlTRAVEL_DTEMonth, ddlDEPARTURE_US_DTEDay e ddlDEPARTURE_US_DTEMonth.
