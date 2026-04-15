# Padrões de UI — Navegação e Layout

Documento base de arquitetura visual do dashboard. Define o modelo de navegação adotado e os contratos que o desenvolvimento deve respeitar. Registra também o que ainda precisa ser confirmado para não travar implementação.

---

## 1. Modelo de Navegação — Master-Detail com Drawer

Toda a interface do dashboard segue o padrão **lista → detalhe**. O detalhe abre num drawer lateral (painel deslizante), sem trocar de página.

```
┌─────────────────┬──────────────────────────────────┐
│  Lista (master) │  Drawer (detail)                 │
│                 │                                  │
│  Item 1         │  Conteúdo do item selecionado    │
│  Item 2  ──────►│  (formulário, log, fatura, etc.) │
│  Item 3         │                                  │
└─────────────────┴──────────────────────────────────┘
```

**Princípio:** o usuário nunca perde o contexto da lista. O drawer abre sobre ou ao lado da lista — a lista permanece visível ou acessível sem clicar em "voltar".

---

## 2. O Drawer é um componente React reutilizável

O drawer não é um iframe nem um embed — é um **componente client-side** (`SolicitanteForm`, `IntegracaoDrawer`, etc.) que recebe dados via props. O mesmo componente é montado em contextos diferentes:

- Como **drawer** dentro de uma página de lista (ex: click na linha abre drawer)
- Como **página inteira** em rotas públicas standalone (ex: `/[shortId]/{applicant_token}` renderiza o form em tela cheia)

**Modo de renderização:** controlado via prop do componente (ex: `mode="pages"` vs `mode="accordion"`), não via query param.

**Por que isso importa:**
- O formulário (engine DS-160) é o mesmo código em todos os contextos
- Links compartilháveis funcionam independente do drawer
- Zero duplicação de lógica

**Query flag futura:** `?embedded=1` é reservado pra quando expormos o form embeddado em sites externos — oculta sidebar/header. Fora do escopo do MVP.

---

## 3. URLs — Sempre Existem

Cada entidade com visualização pública/direta tem URL própria:

| Entidade | URL standalone |
|---|---|
| Detalhe do caso (visão assessor) | `/[shortId]/solicitacoes/[id]` |
| Formulário do solicitante via caso | `/[shortId]/{case_token}/s/{applicant_uid}` *(Fase 4)* |
| Formulário individual | `/[shortId]/{applicant_token}` *(Fase 4)* |
| Página pública do caso | `/[shortId]/{case_token}` |
| Landing da org | `/[shortId]` |
| Detalhe da organização (config) | `/[shortId]/organizacao` |

Drawers são usados DENTRO das páginas (não como rotas próprias):
- `/[shortId]/solicitacoes/[id]` click linha solicitante → drawer com form + info
- `/[shortId]/organizacao` click assessor → drawer edit
- `/[shortId]/organizacao` click white-label → drawer edit

---

## 4. Largura do Drawer

O drawer deve ser dimensionado pelo conteúdo que vai exibir:

| Conteúdo | Largura sugerida | Motivo |
|---|---|---|
| Formulário DS-160 | 65–70% da tela | 23 seções, campos densos |
| Detalhe do caso (lista de membros) | 50% | Tabela + ações |
| Detalhe de log (timeline) | 50% | Timeline + JSON colapsável |
| Comprovante de faturamento | 40% | Conteúdo simples |
| Detalhe de organização | 60% | Abas com tabelas |

> ⚠️ **Valores a confirmar com o design.** O critério é: o conteúdo deve ser legível sem scroll horizontal, e a lista deve permanecer reconhecível ao fundo.

---

## 5. Navegação Hierárquica

No MVP não há drawers aninhados. O detalhe do caso é uma **página completa** (`/[shortId]/solicitacoes/[id]`), e dentro dela o drawer do solicitante com o form DS-160 fica no segundo nível.

```
Nível 1: Lista de casos         /[shortId]/solicitacoes
Nível 2: Detalhe do caso        /[shortId]/solicitacoes/[id]   (página)
Nível 3: Drawer do solicitante  → DS-160 + info (drawer dentro da página)
```

Essa escolha mantém a lista de casos acessível pela sidebar + detalhe do caso tem URL própria pra compartilhar entre assessores da mesma org.

---

## 6. Navegação Global (Sidenav)

O dashboard tem uma sidenav fixa à esquerda com os módulos principais:

```
┌──────────┬─────────────────────────────────────────┐
│          │                                         │
│ Sidenav  │  Conteúdo principal (lista + drawer)    │
│          │                                         │
│ Casos    │                                         │
│ Logs     │                                         │
│ Fatura   │                                         │
│ Config   │                                         │
│          │                                         │
└──────────┴─────────────────────────────────────────┘
```

A sidenav é o único elemento de navegação global — não há breadcrumb, não há tabs de nível superior. A hierarquia é expressa pelo drawer.

> ⚠️ **Itens da sidenav por role ainda precisam ser detalhados.** O que o assessor vê vs. o que o master vê está mapeado em [index.md](./index.md) mas a representação visual (ícones, labels, agrupamentos) é a definir.

---

## 7. O que está definido vs. o que está em aberto

### Definido — não mudar sem decisão explícita

| Decisão | Motivo |
|---|---|
| Drawer é embed de URL standalone | Evita duplicação, garante links compartilháveis |
| `embedded=1` oculta nav/header no formulário | Já especificado no engine |
| Toda entidade tem URL própria | Funciona fora do drawer |
| Navegação é lista → detalhe, sem páginas intermediárias | Reduz cliques e redirecionamentos |

### Em aberto — confirmar durante o desenvolvimento

| Ponto | Impacto se errar |
|---|---|
| Estrutura exata dos query params do drawer | Baixo — só refactor de URL |
| Largura do drawer por tipo de conteúdo | Baixo — CSS |
| Drawers aninhados vs. página completa para o formulário | Médio — UX do assessor |
| Itens e agrupamentos da sidenav por role | Baixo — visual apenas |
| Comportamento mobile (drawer vira página completa?) | Médio — mas mobile não é escopo do MVP |
