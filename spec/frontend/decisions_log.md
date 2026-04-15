# Log de Decisões

Registro das decisões que moldam a implementação. Atualizar sempre que uma nova decisão for tomada pra evitar retrabalho e perda de contexto.

---

## Nomenclatura

**Decisão:** O código usa `solicitação`/`solicitacoes`. O spec histórico usa `caso`. São equivalentes — `solicitação = caso`.

**Por que:** Não vale o refactor massivo pra renomear tudo no código (URLs, types, actions, tabelas). Spec foi atualizado pra deixar claro.

**Impacto:** Todos os novos arquivos seguem `solicitação`. Arquivos antigos do spec que falam de `caso` ficam como estão (foi adicionado nota explicativa nos índices).

---

## Stack técnica (spec → código)

| Spec diz | Código implementa |
|----------|-------------------|
| Supabase (auth + DB + storage) | Better Auth + Drizzle + Turso/libSQL |
| `AppCore` / `sbFetch` / `sbGet` | Next.js App Router + Server Components + Server Actions |
| Mailgun | Resend (planejado — integração global master) |
| Stripe | Stripe (quando chegar na Fase 7 — Billing) |

Spec foi atualizado pra refletir a stack real.

---

## URLs e roteamento

**Decisão:** Tudo escopado por organização vive sob `/[shortId]/*`. Apenas páginas verdadeiramente globais (landing `/`, signin master `/signin`, `/organizacoes`, `/integracoes`) ficam fora desse namespace.

**URLs canônicas:**

| Propósito | URL |
|-----------|-----|
| Landing plataforma | `/` |
| Signin master | `/signin` |
| Signup | `/auth/signup` |
| Signout | `/auth/signout` |
| Landing org (pública) | `/[shortId]` |
| Signin branded org | `/[shortId]/signin` |
| Share caso (público) | `/[shortId]/{case_token}` |
| Share solicitante (público, futuro) | `/[shortId]/{applicant_token}` |
| App: solicitações | `/[shortId]/solicitacoes` |
| App: detalhe caso | `/[shortId]/solicitacoes/[id]` |
| App: execuções | `/[shortId]/execucoes` |
| App: faturamento | `/[shortId]/faturamento` |
| App: organização (config + assessores + integrações) | `/[shortId]/organizacao` |
| Master: lista orgs | `/organizacoes` |
| Master: integrações globais | `/integracoes` |

---

## Tokens de acesso público

**Decisão:** Dois tipos de link convivem:
1. **Link do caso** — `/[shortId]/{case_token}` — mostra lista de solicitantes, cada um clicável
2. **Link individual do solicitante** — `/[shortId]/{applicant_token}` — mostra SÓ o formulário daquele solicitante, isolado

Ambos usam o mesmo padrão de token (16 chars hex, `crypto.randomBytes(8).toString('hex')`).

**Por que:** É possível compartilhar o acesso ao grupo todo (pai recebe o link do caso) mas também compartilhar individualmente sem expor outros (pai manda só o link do filho, filho não vê os dados dos pais).

**Arquivos/tabelas:**
- `share_link` — existe (token do caso)
- `applicant_share_link` — a criar (Fase 4)

**Middleware:** distingue sem conflito porque ambos têm formato 16 hex, e a resolução consulta primeiro `share_link`, depois `applicant_share_link`. Não encontrado em nenhum → redirect pra `/[shortId]`.

---

## Reuso do Form Engine

**Decisão:** O mesmo componente `SolicitanteForm` (a construir na Fase 5) é montado em 3 lugares:

1. **Drawer do assessor** (`/[shortId]/solicitacoes/[id]` → click na linha do solicitante) — modo `accordion`, edição livre
2. **Público via link do caso** (`/[shortId]/{case_token}/s/{applicant_uid}`) — modo `pages`, botão "Voltar ao caso"
3. **Público via link individual** (`/[shortId]/{applicant_token}`) — modo `pages`, sem referência ao caso

**Por que:** DRY. O engine é agnóstico do contexto — só recebe a solicitante_uid + modo de exibição + flag de quem está editando.

---

## White-label

**Decisão:** Campos editáveis são:
- `shortId` — slug da URL
- `nome` — público
- `whatsapp` — suporte
- `logoLight` + `logoDark` — versões pra fundo claro/escuro
- `iconLight` + `iconDark` — ícone/favicon
- `color1` / `color2` / `color3` — paleta da marca
- `fontTitle` / `fontBody` — Google Fonts

Fallback quando `logo*` é null: renderiza `shortId` em badge colorido.

**Editado via:** lista clicável de 4 itens (Short ID, Cores, Marca, Tipografia) em `/[shortId]/organizacao`, cada um abrindo drawer próprio.

---

## Metadata do caso (observação futura)

**Decisão:** Adiado. Cada meta-dado pode morar em lugar diferente.

Candidatos (ainda a decidir):
- `tipo_visto` (B/F/J/O) — provavelmente na tabela `solicitacao`
- `consulado` — idem ou em entidade separada "agendamento"
- `data_entrevista` — idem
- `status_geral` ("Em andamento"/"Pronto"/"Encerrado") — calculado ou manual?

**Quando decidir:** antes da Fase 5 (Form Engine), porque `tipo_visto` controla quais seções do DS-160 aparecem.

---

## Integrações

**Decisão:** Catálogo declarativo via `IntegracaoField[]`. Dois escopos:

**Globais (só master):** Resend, Apify, Vercel, GitHub, Turso, Addy, CapMonster
**Por-org (assessor + master):** Z-API

Cada integração declara seus próprios campos (`apiKey`, `token`, `url` etc.). UI genérica renderiza inputs dinamicamente.

---

## Prioridades (roadmap)

Fase 0 (agora) → 1 (UI) → 2 (revoke link) → 3 (password recovery) → 4 (tokens individuais) → 5 (Form Engine) → 6 (hotpage) → 7 (billing) → 8 (logs)

Ver [status.md](./status.md) pra estado atual de cada fase.

---

## Arquitetura de drawer

**Decisão:** Drawers são componentes React reutilizáveis (não iframes). Navegação de lista → detalhe abre em drawer quando faz sentido; páginas inteiras quando a hierarquia é clara (ex: `/[shortId]/solicitacoes/[id]`).

`?embedded=1` fica preservado como flag futura que oculta sidebar/header (para casos onde o form é montado como embed num site externo), mas não é usado no MVP.

---

## O que NÃO vamos implementar no MVP

- Checkout B2C (`/[shortId]/checkout`) — V2
- Analytics avançado (`/analytics`) — V2
- Webhooks de saída
- Auditoria de alteração de credenciais (log de quem alterou)
- Export CSV de logs
- Preview em tempo real no editor de whitelabel
- Validação de contraste WCAG automática

Todos ficam como "observações futuras" no [status.md](./status.md).
