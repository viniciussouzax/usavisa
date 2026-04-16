# 01. Visa Status Check & Results Modal

**URL:** `https://ceac.state.gov/CEACStatTracker/Status.aspx`
**Título CEAC:** Visa Status Check

---

## 1. Visão Geral da Entidade

Esta é a única página e camada primária da automação "Visa Status Check". Ao contrário da automação do DS-160, que percorre dezenas de páginas redirecionando de URL, o rastreador de status do CEAC opera quase integralmente via blocos condicionais (`UpdatePanels` em ASP.NET AJAX) na mesma URL. O resultado da consulta não nos leva para uma nova janela, mas sim aciona um modal flutuante com a estrutura da resposta.

Portanto, esta documentação descreve as duas Fases que ocorrem nesta única URL: **O Preenchimento Tático** e a **Interceptação do Resultado (Modal)**.

---

## 2. Fase 1: Injeção de Dados (Status Check Form)

O formulário possui uma lógica sequencial de preenchimento.

### 2.1 Campo Padrão: Application Type
- **ID:** `Visa_Application_Type` (Dropdown)
- **Opção Padrão:** O CEAC defaulta para `NIV` (NONIMMIGRANT VISA).
- **Postback:** Se trocar a indexação, ele enviará um postback. A automação normalmente mantém `NIV` salvo que deseje `IV` (Immigrant).

### 2.2 Campo Localização (Location)
- **ID:** `Location_Dropdown`
- **Tipo:** `<select>` (Lista de todos os postos Consulares Globais, Ex: `SPL` = Sao Paulo, `BSB` = Brasilia).

### 2.3 Campo Identificação (Application ID)
- **ID:** `Visa_Case_Number` (Nome clássico mas serve também para Application ID).
- **Limite:** 50 caracteres.
- **Tratamento:** O bot deve injetar o ID do formulário submetido. (ex: `AA00FE8UK3`).

### 2.4 Campos Condicionais Anti-Bot (Data de 2022+)
Para formulários mais recentes, o Departamento de Estado inseriu confirmações adicionais para coibir varreduras massivas:

| Campo | ID CEAC | Lógica Bot |
|-------|---------|------------|
| Passaporte | `Passport_Number` | Número cru do passaporte do requerente |
| Sobrenome | `Surname` | Primeiras 5 letras do sobrenome inserido (ex: `rodri`) |

> **Nota Oficial do Gov:** "For applicants who completed their forms prior to January 1, 2022, please put NA into the Passport and Surname fields." 
O bot precisa saber dinamicamente se injetará `NA` ou o dado real do cliente baseado na safra do Application ID.

### 2.5 Resolução Humana/Mecânica (Captcha)
- **ID Input Computável:** `ctl00$ContentPlaceHolder1$Captcha` (O campo onde se digita).
- **ID BotDetect Image:** `c_status_ctl00_contentplaceholder1_defaultcaptcha_CaptchaImage`.
O motor captura a base64, envia para um resolvedor, e insere no target.

### 2.6 Disparo da Ação (Submissão)
- **Ação Botão:** `ctl00_ContentPlaceHolder1_btnSubmit`
- Funciona disparando `WebForm_DoPostBackWithOptions` para buscar os dados de maneira assíncrona ("Loading...").

---

## 3. Fase 2: Interceptação do Resultado (O Modal AJAX)

Após a submissão correta e aguardado o tempo da barreira "Loading `ctl00_ContentPlaceHolder1_imgProgress`", o ASP.NET renderiza um modal invisível (`style="display: block"`) em cima da tela atual. 
A Engine do robô deve fazer *scraping* agressivo desse painel.

### 3.1 Entidades para Extração do Scraping ("Scrape Targets")

O robô precisa extrair e classificar os seguintes elementos textuais do modal retornado `ctl00_ContentPlaceHolder1_ucApplicationStatusView_pnlStatus`:

1. **Status Geral do Visto**
   - **ID DOM:** `..._lblStatus`
   - **Exemplos Encontrados:** `Issued`, `Refused`, `Administrative Processing`, `Application Received`.
   - *Este é o campo binário essencial que a automação enviará devidamente planilhado ou avisará para a API master.*

2. **Cronologia (Timestamps do Governo)**
   - Caso Criado: `..._lblSubmitDate`
   - Última Atualização: `..._lblStatusDate`

3. **Laudo / Texto Analítico Explicativo**
   - **ID DOM:** `..._lblMessage`
   - Retorna a cartilha integral consular (Ex: "The consular section has completed processing your application and your visa has been issued..."). Crucial ser repassado ao cliente.

### 3.2 Saída Elegante da Etapa
O robô pode forçar a quebra da automação nesse momento ou fechar a janela amistosamente caso queira engatilhar um *loop* (verificando vários CPFs em sequência) via botão: `..._lnkCloseInbox`.
