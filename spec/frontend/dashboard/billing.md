# Faturamento — Visão da Assessoria

> **⚠️ Fase 7 — fora do MVP atual.** A página `/[shortId]/faturamento` existe como placeholder. Toda a lógica de plano, cobrança e invoices depende de integração Stripe (ainda não integrada) + job de reconciliação mensal.

Página onde o assessor acompanha o consumo da própria organização, o histórico de faturas e o status do plano contratado.

**Acesso:** Assessor (própria organização apenas).
**URL:** `/[shortId]/faturamento`

> A visão do Master sobre o faturamento de qualquer organização está em [organizations.md](./organizations.md) — Aba: Histórico de Faturamento.

---

## 1. Resumo do Plano (topo da página)

```
┌──────────────────────────────────────────────────────────────┐
│  Plano atual: Pro                         Renovação: 15/Mai  │
│                                                              │
│  Casos ativos     12 / 50      ████████░░░░░░░░  24%        │
│  Automações/mês    7 / 20      ████░░░░░░░░░░░░  35%        │
│  Armazenamento   240MB / 1GB   ████░░░░░░░░░░░░  24%        │
└──────────────────────────────────────────────────────────────┘
```

| Elemento | Detalhe |
|---|---|
| Nome do plano | Free · Starter · Pro · Enterprise |
| Data de renovação | Próximo ciclo de cobrança |
| Métricas de uso | Barra visual por recurso — valor atual vs. limite do plano |
| Alerta de limite | Destaque visual quando uso > 80% em qualquer métrica |

---

## 2. Fatura do Período Atual

Detalhamento do que está sendo consumido no ciclo atual (ainda não fechado):

| Item | Quantidade | Valor unit. | Subtotal |
|---|---|---|---|
| Plano Pro (assinatura mensal) | 1 | R$ X,XX | R$ X,XX |
| Automações DS-160 excedentes | 0 | R$ X,XX | — |
| Armazenamento excedente | 0 | R$ X,XX | — |
| **Total estimado do período** | | | **R$ X,XX** |

- Período: data de início e fim do ciclo atual
- Status: `Em aberto` — fecha na data de renovação
- Nota: itens excedentes só aparecem se o uso ultrapassar o limite do plano

---

## 3. Histórico de Faturas

Lista de cobranças dos ciclos anteriores:

| Período | Valor | Status | Data do pagamento | Fatura |
|---|---|---|---|---|
| Mar/2025 | R$ X,XX | `Pago` | 15/03/2025 | [Baixar PDF] |
| Fev/2025 | R$ X,XX | `Pago` | 15/02/2025 | [Baixar PDF] |
| Jan/2025 | R$ X,XX | `Falhou` | — | [Baixar PDF] |

**Status possíveis:**

| Status | Descrição |
|---|---|
| `Pago` | Cobrança processada com sucesso |
| `Pendente` | Aguardando compensação |
| `Falhou` | Cobrança recusada — exige ação |
| `Estornado` | Valor devolvido |

Fatura com status `Falhou` → destaque em vermelho + mensagem orientando a atualizar dados de pagamento via contato com a assessoria/Master.

---

## 4. Dados de Pagamento

Exibe o método de pagamento ativo (cartão ou boleto) de forma mascarada:

```
Cartão de crédito    •••• •••• •••• 4242    Visa    Expira 12/2026
```

- O assessor **não edita** dados de pagamento diretamente — alterações são feitas pelo Master
- Botão **"Solicitar alteração"** → abre modal com campo de mensagem enviada por email ao Master

---

## 5. Permissões

| Ação | Assessor | Master |
|---|---|---|
| Ver resumo do plano próprio | ✅ | ✅ |
| Ver fatura do período atual | ✅ | ✅ |
| Ver histórico de faturas | ✅ | ✅ |
| Baixar PDFs de faturas | ✅ | ✅ |
| Editar dados de pagamento | ❌ | ✅ |
| Alterar plano | ❌ | ✅ |
| Ver faturamento de outras orgs | ❌ | ✅ (via organizations.md) |
