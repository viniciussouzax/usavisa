# Integrações — Credenciais e Serviços Externos

Painel de configuração de todas as integrações externas. Credenciais sensíveis são armazenadas criptografadas (implementação pendente) e nunca expostas em texto após o salvamento.

**Dois escopos:**
- **Globais (master)** — URL: `/integracoes`
- **Por organização (assessor + master)** — URL: `/[shortId]/organizacao` (seção "Integrações")

---

## 1. Catálogo + estado persistido

As integrações são declaradas em [app/data.ts](../../app/data.ts) via `GLOBAL_INTEGRATION_CATALOG` (7 serviços) e `ORG_INTEGRATION_CATALOG` (1 serviço por enquanto).

O catálogo define o **schema dos campos** de cada integração. O estado (conectado/não + valores das credenciais) é persistido em:

- `global_integration` — uma linha por integração global configurada
- `org_integration` — uma linha por (organização × integração)

A UI mescla catálogo + estado ao renderizar.

---

## 2. Integrações Globais (Master)

### Email — Resend

Email transacional: recuperação de senha, convites de assessor, envio de links de acesso.

| Campo | Notas |
|---|---|
| `apiKey` | Chave privada do Resend (`re_...`) |
| `fromEmail` | Email remetente (ex: `noreply@sends160.site`) |
| `fromName` | Nome remetente (ex: `Sends160`) |

Docs: https://resend.com/docs

---

### Captcha — CapMonster

Resolução automática de CAPTCHAs do CASV/consulado (usado pelos Actors).

| Campo | Notas |
|---|---|
| `apiKey` | Chave privada do CapMonster |

Docs: https://docs.capmonster.cloud

---

### Automação — Apify

Execução dos Actors que preenchem o DS-160 no portal CEAC.

| Campo | Notas |
|---|---|
| `apiToken` | Token de API (`apify_api_...`) |
| `actorId` | ID do actor DS-160 padrão (opcional) |

Docs: https://docs.apify.com

---

### Deploy — Vercel

Plataforma de hospedagem. Informações usadas pra status de deploys + features futuras.

| Campo | Notas |
|---|---|
| `token` | Vercel token |
| `teamId` | Team ID (`team_...`) |
| `projectId` | Project ID (`prj_...`) |

Docs: https://vercel.com/docs

---

### Código — GitHub

Repositório + CI/CD.

| Campo | Notas |
|---|---|
| `pat` | Personal Access Token (`ghp_...`) |
| `owner` | Organização ou usuário no GitHub |
| `repo` | Nome do repositório |

Docs: https://docs.github.com

---

### Banco de Dados — Turso

Conexão principal com o banco de produção (libSQL/SQLite distribuído).

| Campo | Notas |
|---|---|
| `databaseUrl` | URL `libsql://...turso.io` |
| `authToken` | Auth token gerado em `turso db tokens create` |

Docs: https://docs.turso.tech

---

### Domínio — Addy

Encaminhamento de emails e aliases por organização.

| Campo | Notas |
|---|---|
| `apiKey` | Chave de API |
| `domain` | Domínio configurado |

Docs: https://addy.io/docs

---

### Pagamentos — Stripe *(V2)*

Planejado pra Fase 7 (Billing). Ainda não catalogado.

---

## 3. Integrações por Organização (`/[shortId]/organizacao`)

### WhatsApp — Z-API

Envio e recebimento de mensagens via WhatsApp — cada assessoria conecta sua própria instância Z-API.

| Campo | Notas |
|---|---|
| `instanceId` | Instance ID da sua conta Z-API |
| `token` | Token da instância |
| `securityToken` | Client Token (opcional, requer autenticação dupla) |

Docs: https://developer.z-api.io/

---

## 4. UI

- **Lista** de integrações (catálogo mergeado com estado)
- **Click na linha** abre drawer de edição ([integracao-drawer.tsx](../../components/layout/integracao-drawer.tsx))
- Drawer gera inputs dinamicamente a partir dos `fields` da integração
- Toggle "Integração ativa" — liga/desliga sem apagar credenciais
- Botão "Desconectar" (destrutivo) apaga as credenciais
- Links pra documentação oficial quando disponíveis

---

## 5. Persistência — 🔶 parcial

- Schema pronto em `global_integration` / `org_integration`
- Action `upsertOrgIntegration` / `upsertGlobalIntegration` implementadas
- **Falta:** ligar no submit do drawer (hoje só fecha o drawer sem persistir)

---

## 6. Funcionalidades Futuras

- Botão "Testar conexão" por integração
- Criptografia das credenciais em repouso
- Log de alterações (quem, quando, qual serviço — sem logar o valor)
- Webhooks de saída (pra CRM da assessoria, Zapier)
