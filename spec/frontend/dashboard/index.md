# Dashboard — Índice e Mapa de Navegação

Interface central de gestão da plataforma. Renderiza páginas e menus com base no role do usuário autenticado.

> **Terminologia:** "caso" = "solicitação" no código. Ver [decisions_log.md](../decisions_log.md).

---

## Roles

| Role | Quem é | O que acessa |
|---|---|---|
| `assessor` | Profissional da assessoria parceira (papel `member`/`admin`/`owner` na org) | Casos e solicitantes da própria organização, configurações de marca, logs da org |
| `master` | Dev/Admin da plataforma (coluna `role = "admin"` na tabela `user`) | Tudo — todas as organizações, integrações globais, logs de todas as orgs |

Assessores são criados manualmente pelo Master via UI em `/organizacoes` (fluxo de criar organização permite batch de assessores). Não há auto-cadastro público para acessores. Ver [auth.md](./auth.md).

---

## Mapa de Páginas

### Acesso público (sem login)

| Página | URL | Arquivo |
|---|---|---|
| Landing da plataforma | `/` | — |
| Signin (master) | `/signin` | [auth.md](./auth.md) |
| Signin (branded por org) | `/[shortId]/signin` | [auth.md](./auth.md) |
| Recuperação de senha *(Fase 3)* | `/signin/recuperar` | [auth.md](./auth.md) |
| Redefinição de senha *(Fase 3)* | `/signin/redefinir?token=` | [auth.md](./auth.md) |
| Landing pública da organização | `/[shortId]` | [org-page.md](./org-page.md) |
| Checkout de serviços *(V2)* | `/[shortId]/checkout` | [checkout.md](./checkout.md) |
| Página pública do caso (link do caso) | `/[shortId]/{case_token}` | [case-detail/public-access.md](./case-detail/public-access.md) |
| Formulário individual via link do caso *(Fase 4)* | `/[shortId]/{case_token}/s/{applicant_uid}` | [case-detail/public-access.md](./case-detail/public-access.md) |
| Formulário individual via link direto *(Fase 4)* | `/[shortId]/{applicant_token}` | [case-detail/public-access.md](./case-detail/public-access.md) |

---

### Assessor — após login

| Página | URL | Arquivo | Descrição |
|---|---|---|---|
| Lista de Solicitações | `/[shortId]/solicitacoes` | — | Todos os casos da organização |
| Detalhe do Caso | `/[shortId]/solicitacoes/[id]` | [case-detail/index.md](./case-detail/index.md) | Membros, progresso, links de acesso |
| Formulário do Solicitante *(Fase 5)* | *drawer dentro do detalhe do caso* | [../formulario/index.md](../formulario/index.md) | DS-160 em modo assessor (accordion) |
| Execuções | `/[shortId]/execucoes` | — | Status de automações |
| Faturamento *(Fase 7)* | `/[shortId]/faturamento` | [billing.md](./billing.md) | Plano, consumo e histórico |
| Organização (config + assessores + integrações) | `/[shortId]/organizacao` | [organizations.md](./organizations.md) | White-label, assessores, Z-API |

---

### Master — após login

| Página | URL | Arquivo | Descrição |
|---|---|---|---|
| Lista de Organizações | `/organizacoes` | [organizations.md](./organizations.md) | Todas as assessorias cadastradas |
| Detalhe da Organização | `/[shortId]/organizacao` (via "Acessar") | [organizations.md](./organizations.md) | Mesmo componente da visão do assessor |
| Integrações globais | `/integracoes` | [integrations.md](./integrations.md) | Resend, Apify, Vercel, GitHub, Turso, Addy, CapMonster |
| Logs globais *(Fase 8)* | `/master/logs` | [logs.md](./logs.md) | Execuções de todas as organizações |

> O Master também acessa todas as páginas do Assessor para qualquer organização — clicando "Acessar" na lista de orgs.

---

## Hierarquia de Navegação (fluxo operacional do Assessor)

```
/[shortId]/solicitacoes
  Lista de Solicitações
    └── /[shortId]/solicitacoes/[id]          → Detalhe do Caso
          ├── Membros: lista com progresso
          ├── Links de acesso (compartilhamento)
          └── [drawer] Formulário DS-160       → Preenchimento/revisão
```

---

## Hierarquia de Navegação (fluxo do Master)

```
/organizacoes
  Lista de Organizações
    └── [Acessar] /[shortId]/organizacao      → Detalhe + white-label + assessores
          └── /[shortId]/solicitacoes ...     → Entra como se fosse owner

/integracoes                                  → Credenciais globais

/master/logs (Fase 8)                         → Logs consolidados
```

---

## Arquivos de Spec

| Arquivo | Conteúdo |
|---|---|
| [ui-patterns.md](./ui-patterns.md) | Padrões de navegação — drawer, URLs, sidenav |
| [auth.md](./auth.md) | Login, recuperação de senha, criação de assessor |
| [organizations.md](./organizations.md) | Lista e detalhe de organizações |
| [whitelabel.md](./whitelabel.md) | Logo, cores e tipografia por organização |
| [org-page.md](./org-page.md) | Landing pública da org — hotpage Linktree |
| [checkout.md](./checkout.md) | **V2** — checkout de serviços da assessoria |
| [billing.md](./billing.md) | **V2** — faturamento |
| [integrations.md](./integrations.md) | Credenciais e integrações externas (Master) |
| [logs.md](./logs.md) | **V2** — logs estruturados |
| [case-detail/index.md](./case-detail/index.md) | Detalhe do caso: membros, progresso, compartilhamento |
| [case-detail/public-access.md](./case-detail/public-access.md) | Experiência do solicitante via link público |
