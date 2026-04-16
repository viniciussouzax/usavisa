# Especificação de CAPTCHA (BotDetect / CapMonster)

> **Natureza deste documento:** Os seletores e comportamentos aqui descritos são **fatos sobre o formulário CEAC do governo americano**. A decisão de serviço de resolução (CapMonster) é uma **decisão arquitetural** desta nova implementação.

---

## 1. Os 3 Momentos de CAPTCHA no DS-160

O CEAC exige resolução de CAPTCHA em exatamente **3 pontos** do fluxo, com comportamentos distintos entre si:

| # | Página | Obrigatoriedade | Contexto |
|---|--------|----------------|---------|
| 1 | `01_apply.md` — Start/Location | **Sempre obrigatório** | Necessário para iniciar ou recuperar qualquer aplicação |
| 2 | `02_recovery.md` — Recovery | **Condicional** | Só aparece após erro de preenchimento numa tentativa anterior. A engine deve **verificar a presença** do CAPTCHA antes de tentar resolvê-lo |
| 3 | `25_sign_and_submit.md` — Assinatura | **Sempre obrigatório** | Necessário para finalizar e submeter a aplicação preenchida |

---

## 2. Identificação do CAPTCHA na DOM do CEAC

O CEAC usa o componente **BotDetect CAPTCHA** em todas as 3 ocorrências.

### Seletores de Imagem (para captura visual)
```
img[id$='_CaptchaImage']
img[src*='captcha']
```
> A página `01_apply` possui adicionalmente um ID canônico longo que pode ser usado como âncora de confirmação:
> `img[id$='c_default_ctl00_sitecontentplaceholder_uclocation_identifycaptcha1_captchaimage']`

### Seletores de Input (para injeção da resposta)
```
input[id$='_txtCodeTextBox']
input[id$='_CodeTextBox']
```

### Seletor do Botão de Recarregar Imagem
Quando o CAPTCHA for resolvido incorretamente, o CEAC mantém o usuário na mesma página com um novo desafio visual. O botão para forçar uma nova imagem (útil em caso de imagem ilegível) pode ser identificado por:
```
a[id*="ReloadLink"]
a[id*="ReloadIcon"]
img[id*="ReloadIcon"]
```

---

## 3. Decisão Arquitetural: Serviço de Resolução

**O serviço de resolução de CAPTCHA adotado é o CapMonster.**

- Nenhuma outra alternativa (ex: visão computacional local, outros serviços de terceiros) deve ser prevista na nova arquitetura.
- A chave de API do CapMonster será gerenciada externamente à engine (via configuração de ambiente), nunca hardcoded.

---

## 4. Comportamento Esperado da Engine

A engine deve tratar o CAPTCHA em cada uma das 3 ocorrências de forma **idêntica e centralizada** — não como blocos duplicados por página:

1. **Detectar** se o elemento de imagem do CAPTCHA está visível na DOM (especialmente crítico para o ponto 2 — Recovery, que é condicional).
2. **Capturar** a imagem do desafio.
3. **Enviar** ao CapMonster para resolução.
4. **Injetar** a resposta no campo de input correspondente.
5. Em caso de falha na resolução ou rejeição pelo servidor, acionar o **botão de recarregar** e repetir o ciclo com política de retry limpa e arquitetada — nunca via timeouts arbitrários (`sleep`).

---

## 5. Tipologia e Normalização de Respostas — Os 3 Tipos de CAPTCHA do CEAC

O CEAC opera com **3 tipos de CAPTCHA distintos**, cada um com parâmetros de resolução e normalização diferentes:

### Tipo 1: ImageToText (BotDetect — padrão CEAC)
Usado nos 3 momentos canônicos (Landing, Recovery, Sign).

| Parâmetro | Valor |
|---|---|
| Tipo CapMonster | `ImageToTextTask` |
| Case | Insensitivo por padrão (normalizar para maiúsculo é seguro) |
| Charset | `[A-Za-z0-9]` apenas — remover espaços e caracteres especiais |
| minLength | 1 |
| maxLength | 16 |

**Regra de normalização:**
1. Remover todos os espaços
2. Remover qualquer caractere que não seja `[A-Za-z0-9]`
3. Truncar no `maxLength`
4. Rejeitar se resultado tiver menos de `minLength` caracteres — registrar como `captcha_failed` e tentar nova resolução

### Tipo 2: TSPD/Akamai (Challenge State)
Aparece quando o Akamai detecta comportamento suspeito e exibe uma tela de desafio antes do CEAC. **Case-sensitive** — este é o diferencial crítico em relação ao Tipo 1.

| Parâmetro | Valor |
|---|---|
| Tipo CapMonster | `ImageToTextTask` |
| Case | **Sensível** (`preserveCase: true`) — nunca normalizar para maiúsculo |
| minLength | 4 |
| maxLength | 8 |
| Prompt AI Vision | "Read exactly the CAPTCHA text. Preserve uppercase and lowercase." |

> **Regra:** Se o TSPD CAPTCHA falhar após retentativas, o estado deve ser registrado como sessão irrecuperável (`anti_bot` / `session_expired`) — não continuar tentando.

### Tipo 3: hCaptcha
Presente em páginas auxiliares do CEAC (não nos 3 momentos canônicos do DS-160). Requer resolução via serviço de terceiros com `websiteURL` e `siteKey` fornecidos pela página.

| Parâmetro | Valor |
|---|---|
| Tipo CapMonster | `HCaptchaTaskProxyless` |
| Entrada | `websiteURL` + `websiteKey` (siteKey do `<script>` hCaptcha) |
| Saída | Token `gRecaptchaResponse` (string longa) |
| Timeout esperado | Até **120 segundos** — significativamente mais lento que ImageToText |

> A engine deve aguardar com paciência o token hCaptcha. Não tratar timeout abaixo de 120s como falha.
