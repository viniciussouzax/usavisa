# Módulo Core: Infraestrutura e Shell

Este módulo é a fundação sobre a qual todos os outros níveis (Dashboard, Caso, Formulário) são construídos. Ele gerencia as capacidades transversais da plataforma.

## Stack

- **Framework**: Next.js 16 (App Router) com Turbopack
- **Auth**: Better Auth (adapter Drizzle) — sessions em cookies HTTPOnly
- **Banco**: Turso em produção, SQLite local em dev — ambos via `@libsql/client` (mesma API)
- **ORM**: Drizzle
- **Email transacional**: Resend (integração global configurada pelo master)
- **Deploy**: Vercel (auto-deploy do branch `main`)

## Responsabilidades

O **Core** é o dono único dos seguintes domínios:

1. **Persistência e API**:
   - Acesso a banco via server actions + Drizzle ORM (nunca direto do client).
   - Gerenciamento de env vars via `.env.local` (dev) + Vercel env vars (prod).
2. **Sessão e Autenticação**:
   - Better Auth gerencia cookies, sessions e CSRF.
   - `getUser()` em [lib/auth/index.ts](../../lib/auth/index.ts) — cached via `React.cache`.
   - Middleware `proxy.ts` faz redirect pra signin quando necessário.
3. **Roteamento e URL**:
   - Multi-tenant via `[shortId]` dynamic segment.
   - Resolução de URLs branded via helper `resolveNavHref` em [nav-config.ts](../../components/layout/nav-config.ts).
   - `resolveHomeUrl(userId, role)` em [lib/auth/home-url.ts](../../lib/auth/home-url.ts) determina destino pós-login.
4. **Interface Global (Shell)**:
   - `<Sidebar>` + `<TopBar>` em [components/layout/](../../components/layout/).
   - Toasts via Sonner (já plugado).
   - Theme (light/dark) via `next-themes`.

## Modulação

Componentes client NUNCA fazem `fetch` direto nem manipulam banco. Toda mutação passa por **server actions** em `shared/behaviors/[dominio]/actions/*.action.ts`, que:
- Validam input via Zod
- Checam auth e role via `getUser()` + `isMaster()`
- Checam membership via `getAssessorByUserAndOrg()` quando escopado por org
- Chamam o model em `shared/models/*.ts` pra persistir
- Retornam `{ error: string | null; ...data }`
