# Organizações — Lista e Detalhe

Centraliza a gestão das assessorias parceiras. Master vê a lista global; Assessor vê apenas o detalhe da própria.

---

## 1. Lista de Organizações (Master)

**URL:** `/organizacoes`

Visão panorâmica de todas as assessorias ativas e inativas na plataforma.

### Tabela

| Coluna | Conteúdo |
|---|---|
| ID | Sequencial humano (#1, #2, #3...) |
| Short ID | Slug (`sends160`, `vistopro`, `mundoaberto`) |
| Nome | Nome comercial |
| Assessores | Quantidade de contas (count) |
| Solicitações | Quantidade de casos ativos (count) |
| Ações | Botão **"Acessar"** — entra na org como owner |

### Filtros e busca

*(Observação futura — não no MVP)*

### Ação principal

Botão **"+ Criar Nova"** → abre drawer de criação (ver seção 3).

---

## 2. Detalhe da Organização

**URL:** `/[shortId]/organizacao`

Acessível tanto pelo Master (via "Acessar" na lista) quanto pelos Assessores da própria org (via sidebar "Organização"). Mesmo componente.

Estrutura da página:

### Seção: White label (lista de 4 itens, cada um abre drawer)

| Item | Drawer edita |
|---|---|
| Short ID | `shortId` |
| Cores | `color1`, `color2`, `color3` |
| Marca | `logoLight`, `logoDark`, `iconLight`, `iconDark` |
| Tipografia | `fontTitle`, `fontBody` (via Google Fonts picker) |

Ver [whitelabel.md](./whitelabel.md) pra detalhes.

### Seção: Assessores vinculados (tabela)

| Coluna | Conteúdo |
|---|---|
| Nome | — |
| Email | — |
| Papel | Dono · Admin · Assessor (badge com cor) |
| Status | Ativo · Inativo (badge) |
| Desde | Data de vínculo (`assessor.createdAt`) |

- Click na linha → drawer de edição (nome, email, papel, toggle ativo, alterar senha)
- Botão **"+ Adicionar Assessor"** no header da seção → drawer com form (nome, email, senha, papel)

### Seção: Integrações (tabela)

Integrações escopadas por org. Atualmente só Z-API. Ver [integrations.md](./integrations.md#3-integrações-por-organização).

### Ícone ⚙ ao lado de "Assessores vinculados"

Abre drawer de **Configurações** com:
- Nome, WhatsApp, UID (read-only)
- Toggle "Organização ativa"
- Plano de assinatura (só master pode editar)

---

## 3. Criar Nova Organização (Drawer — só Master)

Drawer em `/organizacoes` permite criar **org + assessores em batch**:

### Identificação

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | texto | ✅ |
| Short ID | slug `[a-z0-9-]+` | ✅ |
| WhatsApp de suporte | dígitos (formato internacional) | ✅ |
| Plano | `free` / `premium` | ✅ |

### Assessores (N linhas, pelo menos 1)

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | texto | ✅ |
| Email | email | ✅ |
| Senha | password (min 8) | ✅ |
| Papel | `owner` / `admin` / `member` | ✅ |

Validação: pelo menos um assessor precisa ter papel `owner`.

Ao submeter, a action server `createOrganizacaoAction`:
1. Cria a organização
2. Cria cada user via `auth.api.signUpEmail` (Better Auth)
3. Insere linha em `assessor` com role

Se qualquer step falhar no meio, a org pode ficar parcialmente criada — TODO adicionar transaction wrap.

---

## 4. Permissões de Acesso

| Ação | Master | Assessor |
|---|---|---|
| Ver lista de organizações | ✅ | ❌ |
| Ver detalhe da própria org | ✅ | ✅ |
| Ver detalhe de outra org | ✅ (via "Acessar") | ❌ (redirect) |
| Criar organização | ✅ | ❌ |
| Editar white-label | ✅ | ✅ (owner/admin) |
| Alterar plano | ✅ | ❌ |
| Toggle ativa/inativa | ✅ | ❌ |
| Adicionar assessor | ✅ | ✅ (owner/admin) |
| Editar assessor | ✅ | ✅ (owner/admin) |

---

## 5. Campos removidos do spec original

Os campos abaixo faziam parte do spec antigo mas não foram implementados. Ficam como observações futuras:

- CNPJ
- Email de contato separado (hoje usa o WhatsApp e o email do owner)
- Endereço (rua, CEP etc.)
- Site
- Observações internas (visíveis só pro master)
- Aba "Limites e Uso" (depende de Billing — Fase 7)
- Aba "Histórico de Faturamento" (Fase 7)
