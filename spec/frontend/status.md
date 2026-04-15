# Status da Implementação

Snapshot do que já está construído e o que ainda falta. Atualizado conforme o código evolui.

**Legenda:** ✅ pronto · 🔶 parcial (UI existe ou backend existe, mas não está totalmente ligado) · ⬜ pendente

---

## Infraestrutura

- ✅ Next.js 16 (App Router) + Turbopack
- ✅ Better Auth com adapter Drizzle (tabelas `user`, `session`, `account`, `verification`)
- ✅ libSQL driver (`@libsql/client`) — dev: SQLite local, prod: Turso (mesmo driver)
- ✅ Schema Drizzle com **11 tabelas** (4 auth + 7 domínio: `organizacao`, `assessor`, `solicitacao`, `solicitante`, `share_link`, `org_integration`, `global_integration`)
- ✅ Migration única squashed em `db/migrations/0000_gorgeous_leopardon.sql`
- ✅ Deploy Vercel conectado ao GitHub (main → prod)
- ✅ Middleware multi-tenant ([proxy.ts](../../proxy.ts)) — detecta token hex de 16 chars, signin branded, segmentos estáticos
- ⬜ Turso provisionado em prod (prod usa `:memory:` placeholder)
- ⬜ Email transacional (Resend não integrado)
- ⬜ CI/CD com testes automatizados

---

## Autenticação

- ✅ Signin master em `/signin`
- ✅ Signin branded por org em `/[shortId]/signin`
- ✅ Signup via Better Auth (`/auth/signup`)
- ✅ Signout (`/auth/signout`)
- ✅ Role gating — `isMaster(role)` helper ([nav-config.ts](../../components/layout/nav-config.ts))
- ✅ Session → org ativa via tabela `assessor` (membership)
- ⬜ Password recovery (`/signin/recuperar`, `/signin/redefinir`) — Fase 3
- ⬜ First-login force-password-change — Fase 3
- ⬜ Bloqueio após N tentativas de login

---

## Multi-tenant

- ✅ Namespace `/[shortId]/*` para tudo escopado por org
- ✅ `/organizacoes` — master only (lista global)
- ✅ `/integracoes` — master only (integrações globais)
- ✅ Redirect pós-login baseado em role + membership ([lib/auth/home-url.ts](../../lib/auth/home-url.ts))
- ✅ Acesso a org alheia é redirecionado pra a própria
- ✅ Sidebar muda conforme contexto (com/sem org, master/não-master)
- ✅ Label "Menu Master" some quando é o único nav visível

---

## Organização

- ✅ Listar/criar/editar (model + actions persistidas)
- ✅ Criar org com múltiplos assessores em batch (via Better Auth `signUpEmail`)
- ✅ **White-label editável via drawers:**
  - shortId, nome, WhatsApp
  - logoLight / logoDark
  - iconLight / iconDark
  - color1 / color2 / color3
  - fontTitle / fontBody (com picker Google Fonts)
- ✅ Plano free/premium (só master edita)
- ✅ Toggle ativa/inativa
- ⬜ Metadata de caso (tipo_visto, consulado, data_entrevista, status_geral) — observação futura

---

## Assessores (membros)

- ✅ Listar por org
- ✅ Adicionar via drawer (dentro do fluxo de criar org OU "Adicionar Assessor")
- ✅ Edit drawer: nome, email, papel, ativo, alterar senha
- ⬜ Remover (botão existe mas não persiste — falta action)
- ⬜ Convite por email (hoje cria direto com senha)

---

## Solicitações (casos)

- ✅ Listar por org
- ✅ Criar (form + action persistindo)
- ✅ Detalhe em `/[shortId]/solicitacoes/[id]`
- 🔶 Editar (drawer existe, action de update não plugada no submit)
- ⬜ Metadata completa (tipo_visto, consulado, data_entrevista, status_geral)
- ⬜ Status "Pronto para envio" automático (depende de progresso do DS-160)

---

## Solicitantes

- ✅ Listar por solicitação
- ✅ Ordem com Titular sempre como #1
- 🔶 Criar (drawer existe, action não plugada)
- 🔶 Edit drawer (existe, action não plugada)
- ⬜ Form DS-160 no drawer — **Fase 5**
- ⬜ Flag `isGroupLead` dedicada (hoje usa `parentesco === "Titular"` como heurística)
- ⬜ Progresso por solicitante

---

## Form Engine (DS-160)

⬜ **TUDO pendente — Fase 5 do roadmap.**

Hoje há apenas um placeholder com ~10 campos genéricos em [public-solicitacao-client.tsx](../../app/[shortId]/[token]/components/public-solicitacao-client.tsx):
- Nome, CPF, Data de nascimento, Nacionalidade, Passaporte + emissão/validade, Email, Telefone

Dados salvos em `solicitante.dadosExtras` (JSON). Sem validação, sem condicionais, sem progresso, sem auto-save.

O engine completo é descrito em [formulario/engine.md](./formulario/engine.md) e cobre 23 seções.

---

## Share Links

- ✅ Gerar token automaticamente ao criar solicitação
- ✅ Acesso público em `/[shortId]/{token}`
- ✅ Redireciona pra landing se token inválido
- ✅ `accessCount` contabilizado
- ✅ Campos `expiresAt` e `revokedAt` no schema
- ✅ Form público salva em `solicitante.dadosExtras`
- ⬜ UI pra revogar/regenerar — **Fase 2**
- ⬜ Token individual por solicitante (`applicant_share_link`) — **Fase 4**
- ⬜ Tela "acesso encerrado" quando revogado

---

## Integrações

- ✅ Listar integrações globais (master) e por org
- ✅ Drawer de edição com campos dinâmicos por integração (via `IntegracaoField[]`)
- ✅ **7 integrações globais catalogadas:** Resend, Apify, Vercel, GitHub, Turso, Addy, CapMonster
- ✅ **1 por-org catalogada:** Z-API
- 🔶 Persistir credenciais (tabelas `org_integration`/`global_integration` prontas + action `upsertOrgIntegration` existe, falta ligar no submit do drawer)
- ⬜ "Testar conexão" por integração
- ⬜ Criptografia das credenciais em repouso
- ⬜ Log de alterações (quem alterou, quando)

---

## Master

- ✅ `/organizacoes` lista global (com contadores de assessores/solicitações)
- ✅ Botão "Acessar" em cada linha — entra na org como se fosse owner
- ✅ Badge "Master" na sidebar quando fora de uma org específica
- ✅ Menu Master unificado com nav principal quando é o único nav
- ⬜ `/master/logs` (logs de todas as orgs) — Fase 8

---

## Páginas públicas

- ✅ Landing da plataforma (`/`)
- ✅ Landing da org (`/[shortId]`) — logo/nome + botão "Entrar" + suporte WhatsApp
- ✅ Signin branded por org (`/[shortId]/signin`)
- ✅ Acesso público do caso (`/[shortId]/{token}`)
- ⬜ Hotpage/Linktree da org (`/[shortId]/configuracoes/pagina-publica`) — **Fase 6**
- ⬜ Página 404 com whitelabel
- ⬜ Tela de "link encerrado" (quando revoke)

---

## UX aplicado (auditoria concluída)

- ✅ Sem bold em linhas de lista (todas tabelas do app)
- ✅ White-label editado via lista clicável + drawers (não form inline)
- ✅ Color picker + input hex em pares (branco de cor)
- ✅ Picker de tipografia com Google Fonts (preview na própria fonte)
- ✅ Preferências do usuário (avatar → dropdown → drawer com nome/email/senha)
- ✅ Tema claro/escuro via `next-themes` (toggle na sidebar)
- ✅ Sheet sempre 100% width no mobile

---

## Próximas ações (do roadmap)

1. **Fase 0** (agora) — limpar spec, criar este status + decisions_log
2. **Fase 1** — preparar drawer do solicitante pra receber Form Engine
3. **Fase 2** — UI de revoke/regenerar share link
4. **Fase 3** — password recovery + first-login
5. **Fase 4** — tokens individualizados por solicitante
6. **Fase 5** — Form Engine DS-160 (seção por seção)
7. **Fase 6** — Org hotpage
8. **Fase 7** — Billing
9. **Fase 8** — Logs
