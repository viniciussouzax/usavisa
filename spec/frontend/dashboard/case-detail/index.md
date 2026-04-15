# Nível 2: Detalhe do Caso (Gestão de Grupo)

Acessado ao clicar em um caso na lista de Solicitações (`/[shortId]/solicitacoes`). Mostra todos os solicitantes vinculados ao caso e centraliza as ações de gestão e compartilhamento.

**URL:** `/[shortId]/solicitacoes/[id]`

> **Terminologia:** `caso = solicitação` no código. Essa página é renderizada a partir de `app/[shortId]/(app)/solicitacoes/[id]/page.tsx`.

---

## 1. Header do Caso

Informações fixas do caso exibidas no topo da página:

| Campo | Descrição |
|---|---|
| Nome do caso | Ex: "Família Silva — Jul/2025" |
| Tipo de visto | B, F, J ou O |
| Consulado / Cidade da entrevista | — |
| Data prevista da entrevista | — |
| Status geral | `Em andamento` / `Pronto para envio` / `Encerrado` |

**Status "Pronto para envio"**: ativado automaticamente quando todos os solicitantes do caso atingem 100% de progresso no formulário.

---

## 2. Lista de Solicitantes

Cada solicitante do caso ocupa uma linha na tabela:

| Coluna | Conteúdo |
|---|---|
| Nome completo | — |
| Papel no caso | `Principal` · `Cônjuge` · `Filho/a` · `Outro` |
| Progresso | Barra visual + percentual (baseado nas seções do schema) |
| Último acesso | Data/hora do último acesso via link (pelo solicitante) |
| Ações | Abrir formulário · Link individual · Remover |

**Clicar na linha** → abre **drawer** com info do solicitante + formulário DS-160 em modo assessor (accordion, edição livre). O drawer não é uma página separada — é componente React montado sobre a lista.

### Solicitante Principal

- Identificado pela flag `isGroupLead = true` no banco
- Exibido com destaque visual na lista (ex: ícone ou badge `Principal`)
- Normalmente é o primeiro membro cadastrado — o assessor pode alterar via ação **"Definir como principal"** em qualquer linha
- Apenas o principal vê a seção 23 (`aisInfo`) no formulário — credenciais AIS, local do CASV e disponibilidade de datas
- As informações de CASV e datas preenchidas pelo principal orientam o agendamento de todo o grupo
- Cada caso tem exatamente **um** principal — definir outro remove a flag do anterior

---

## 3. Adicionar Solicitante

Botão **"+ Adicionar solicitante"** abre modal com campos mínimos:

| Campo | Tipo | Notas |
|---|---|---|
| Nome completo | texto | Identificação na lista e na página pública |
| Relação no grupo | select | Titular, Cônjuge, Filho/a, Outro |
| Email | texto | Opcional — para envio direto do link pela plataforma |

Ao confirmar, cria o registro do solicitante vinculado ao `group_id` com formulário vazio. O link individual é gerado automaticamente junto com o registro.

---

## 4. Compartilhamento de Acesso

### 4.1 Link do Caso — acesso aberto

```
{NEXT_PUBLIC_BASE_URL}/{shortId}/{case_token}
```

- Um token por caso, 16 chars hex (`crypto.randomBytes(8).toString('hex')`)
- Gerado automaticamente ao criar a solicitação
- Persistido em `share_link` (colunas: `token`, `solicitacaoUid`, `createdBy`, `expiresAt`, `revokedAt`, `accessCount`, `createdAt`)
- Quem tiver o link → acessa a página pública do caso (ver [public-access.md](./public-access.md))
- A página mostra todos os membros com nome + progresso
- Qualquer membro pode ser acessado a partir dessa página

**Controles do assessor *(Fase 2 — a implementar):***

```
[ Link do caso: sends160.site/sends160/abc123... ]  [ Copiar ]  [ Gerar novo link ]

Acesso:  ● Ativo   ○ Revogado
```

- **Toggle Ativo/Revogado** — actions `revokeShareLinkAction` / `reactivateShareLinkAction`
- **"Gerar novo link"** — `regenerateShareLinkAction` — cria novo token, revoga anterior
- **Revogação automática** — quando todos os solicitantes atingem 100% no DS-160 *(só funciona depois da Fase 5)*

**Hoje (estado atual):** só botão "Copiar link" existe.

---

### 4.2 Link Individual — acesso específico *(Fase 4 — a implementar)*

```
{NEXT_PUBLIC_BASE_URL}/{shortId}/{applicant_token}
```

- Um token por solicitante, gerado sob demanda via "Copiar link individual" na linha da tabela de solicitantes
- Tabela nova: `applicant_share_link` (formato mesmo do `share_link`, mas FK pra `solicitante.uid`)
- Token **independente** do `case_token` — quem tem o link individual não vê outros membros
- Leva direto ao formulário daquele solicitante isolado
- Usado quando o assessor ou o titular quer compartilhar o acesso de um membro sem expor o caso inteiro

Middleware resolve primeiro em `share_link` (token do caso); se não achar, tenta `applicant_share_link`; se não achar em nenhum → redirect pra `/{shortId}`.

---

### 4.3 Comparativo dos dois links

| | Link do Caso | Link Individual *(Fase 4)* |
|---|---|---|
| URL | `/{shortId}/{case_token}` | `/{shortId}/{applicant_token}` |
| Tabela | `share_link` | `applicant_share_link` |
| Quem vê | Todos os membros do caso | Só o formulário daquele membro |
| Navega para outros membros | ✅ sim | ❌ não |
| Revogação | `revokeShareLinkAction` | Revogado individualmente |
| Novo token | `regenerateShareLinkAction` | "Gerar novo link" por linha |
| Uso típico | Compartilhar com a família inteira | Compartilhar com um membro específico |

**Ambos** redirecionam pra `/{shortId}` se o token for inválido/revogado/expirado — o middleware distingue lendo o token do path e testando os dois tipos.

---

## 5. Estado de Progresso

- Cada solicitante tem progresso individual calculado pelo engine (seções preenchidas / seções obrigatórias)
- O caso é **"Pronto para envio"** somente quando todos os membros estão a 100%
- Progresso atualiza em tempo real conforme o solicitante preenche via link

---

## 6. Ações do Assessor sobre o Caso

| Ação | Comportamento |
|---|---|
| Adicionar solicitante | Cria registro com formulário vazio + gera link individual |
| Remover solicitante | Desvincula do caso; dados do formulário podem ser mantidos ou deletados (confirmação) |
| Abrir formulário (por membro) | Abre DS-160 em modo assessor (accordion, sem restrições) |
| Editar dados do caso | Altera nome, consulado, data de entrevista, tipo de visto |
| Revogar acesso | Toggle — encerra acesso de todos os links do caso |
| Reativar acesso | Toggle inverso — reativa links após revogação manual ou automática |
| Gerar novo link do caso | Invalida `case_token` anterior, cria novo |

---

## 7. O que o Assessor NÃO faz nesta tela

- Não preenche os formulários dos solicitantes (isso é feito via formulário individual)
- Não envia o DS-160 para o consulado (ação separada, pós-validação)
- Não define quais campos herdar entre membros *(funcionalidade planejada para V2 — ver decisions_log)*
