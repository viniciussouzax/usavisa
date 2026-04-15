# Logs — Automações e Actors

> **⚠️ Fase 8 — fora do MVP atual.** Depende de ter Actors (Apify) rodando de verdade. Enquanto não houver execuções reais, essa página não faz sentido.

Central de rastreamento de todas as execuções dos Actors (automações que preenchem o portal DS-160). Permite diagnóstico de falhas, acompanhamento de execuções e auditoria de operações.

**Acesso:** Master (todos os logs da plataforma) · Assessor (logs da própria organização).

**URL (assessor):** `/[shortId]/logs`
**URL (master):** `/master/logs`

---

## 1. Estrutura da Tela

### Filtros

```
[ Organização ▼ ]  [ Status ▼ ]  [ Tipo de evento ▼ ]  [ De: ______ Até: ______ ]  [ Buscar por ID ]
```

| Filtro | Opções |
|---|---|
| Organização | Todas · [lista de orgs] — visível apenas para Master |
| Status | Todos · Sucesso · Falha · Em andamento · Timeout |
| Tipo de evento | Todos · Preenchimento DS-160 · Submissão · Pagamento de taxa · Reenvio |
| Período | Date picker — padrão: últimos 7 dias |
| Busca | Por `case_id`, `applicant_id` ou nome do solicitante |

---

## 2. Tabela de Logs

| Coluna | Conteúdo |
|---|---|
| Data/hora | Timestamp da execução |
| Organização | Nome da assessoria — visível só para Master |
| Caso | Nome do caso + link para o Case Detail |
| Solicitante | Nome + link para o formulário |
| Tipo | Tipo de automação executada |
| Status | `Sucesso` · `Falha` · `Em andamento` · `Timeout` |
| Duração | Tempo total de execução em segundos |
| Ações | Ver detalhes |

Ordenação padrão: mais recente primeiro.

---

## 3. Detalhe de uma Execução (Modal ou página expandida)

Ao clicar em "Ver detalhes":

### Cabeçalho

```
Preenchimento DS-160 — João Silva
Caso: Família Silva — Jul/2025
Executado em: 15/Jul/2025 às 14:32:07
Duração: 48 segundos
Status: ❌ Falha
```

### Timeline de Etapas

Cada execução é dividida em etapas sequenciais. Cada etapa tem status individual:

```
✅ 14:32:07  Iniciando sessão no portal CEAC          0,8s
✅ 14:32:08  Navegando para o formulário DS-160        1,2s
✅ 14:32:09  Preenchendo seção Personal 1              3,4s
✅ 14:32:13  Preenchendo seção Personal 2              2,1s
✅ 14:32:15  Preenchendo seção Travel                  4,7s
❌ 14:32:20  Erro na seção Previous Travel             —
             → Timeout aguardando resposta do portal (30s)
             → Tentativa 1/3: falhou
             → Tentativa 2/3: falhou
             → Tentativa 3/3: falhou
             → Execução encerrada
```

### Payload de Entrada

JSON com os dados do solicitante usados na execução (colapsável):

```json
{
  "applicant_id": "uuid",
  "section": "previousUSTravel",
  "field": "hasBeenInUS",
  "value": "Y",
  ...
}
```

### Mensagem de Erro Completa

```
TimeoutError: Portal CEAC não respondeu após 30 segundos
Stack: actors/ceac_ds160/sections/previous_travel.js:142
Portal status: HTTP 503 (Service Unavailable)
```

### Ações disponíveis

| Ação | Comportamento |
|---|---|
| **Retentar execução** | Reinicia o Actor a partir da última etapa bem-sucedida |
| **Retentar do início** | Reinicia do zero |
| **Marcar como resolvido** | Arquiva o log sem retentar (para falhas que não precisam de ação) |
| **Copiar ID da execução** | Para suporte técnico |

---

## 4. Tipos de Evento Rastreados

| Tipo | Descrição |
|---|---|
| `ds160.fill` | Preenchimento automático do DS-160 no portal CEAC |
| `ds160.submit` | Submissão final do formulário ao consulado |
| `fee.payment` | Pagamento da taxa consular |
| `ds160.resend` | Reenvio por falha anterior |
| `session.login` | Login do Actor no portal CEAC |
| `session.timeout` | Sessão expirada no portal CEAC durante execução |

---

## 5. Status de Execução

| Status | Significado |
|---|---|
| `Em andamento` | Actor rodando neste momento |
| `Sucesso` | Todas as etapas concluídas sem erro |
| `Falha` | Erro não recuperável — exige ação manual |
| `Timeout` | Portal CEAC não respondeu no tempo limite |
| `Parcial` | Algumas seções concluídas, interrompido antes do fim |
| `Resolvido` | Falha marcada manualmente como tratada |

---

## 6. Retenção e Volume

| Aspecto | Decisão |
|---|---|
| Retenção dos logs | 90 dias — logs mais antigos arquivados ou deletados |
| Paginação | 50 registros por página |
| Export | CSV com filtros aplicados — botão "Exportar" no topo da tabela |
| Alertas | Sem alertas automáticos — acompanhamento manual pela tela (notificações são V2) |
