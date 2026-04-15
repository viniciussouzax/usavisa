# Checkout — Pagamento de Serviços da Assessoria

> ⚠️ **V2** — Funcionalidade planejada. Não implementar no MVP.

Página de checkout pública onde o cliente da assessoria pode contratar e pagar por serviços diretamente, sem intermediários. Independente da hotpage, mas pode ser linkada a partir dela como um dos botões do link hub.

**URL:** `app.dominio.com/{org_slug}/checkout`

---

## Posição no ecossistema

```
Hotpage  /{org_slug}
  └── [ Contratar serviço → ]  (botão opcional no link hub)
        └── /{org_slug}/checkout       ← esta página
```

O checkout é autônomo — tem URL própria, pode ser compartilhado diretamente pela assessoria via WhatsApp, email, etc., sem precisar passar pela hotpage.

---

## Fluxo do cliente

```
1. Acessa /{org_slug}/checkout
2. Vê os serviços disponíveis cadastrados pela assessoria
3. Seleciona o serviço desejado
4. Define a quantidade (nº de pessoas, se aplicável)
5. Revisa o total
6. Preenche dados de pagamento
7. Confirma e paga
8. Recebe confirmação na tela + email
9. Assessoria é notificada
```

---

## Página de Checkout (visão do cliente)

```
[ Logo ]  Nome da Assessoria

  Serviços disponíveis

  ┌─────────────────────────────────────────────────────┐
  │ ● Consultoria DS-160 Completa          R$ 350/pessoa│
  │   Preenchimento, revisão e prep. para entrevista    │
  ├─────────────────────────────────────────────────────┤
  │ ○ Revisão de Formulário Existente      R$ 150/pessoa│
  │   Revisão e correção de DS-160 já preenchido        │
  ├─────────────────────────────────────────────────────┤
  │ ○ Consultoria Inicial (chamada)        R$ 200 fixo  │
  │   30 minutos para avaliar seu caso                  │
  └─────────────────────────────────────────────────────┘

  Quantidade de pessoas   [ 1 ▼ ]   (quando cobrado por pessoa)

  ──────────────────────────────────
  Total                   R$ 350,00
  ──────────────────────────────────

  Nome completo    [___________________________]
  Email            [___________________________]
  CPF              [___________________________]

  [ Pagar com PIX ]    [ Pagar com Cartão ]

  Pagamento processado com segurança via Mercado Pago
```

---

## Serviços (cadastro pelo assessor)

**URL:** `/configuracoes/servicos`

| Campo | Tipo | Notas |
|---|---|---|
| Nome do serviço | texto | Ex: "Consultoria DS-160 Completa" |
| Descrição | textarea | Breve descrição do que está incluído. máx. 200 caracteres |
| Preço | valor | Em reais (R$) |
| Tipo de cobrança | select | **Por pessoa** (× quantidade) · **Valor fixo** |
| Ativo | toggle | Ocultar sem deletar |
| Ordem | arrastar | Sequência de exibição no checkout |

---

## Modelo de Receita da Plataforma

| Conceito | Valor |
|---|---|
| Taxa por item processado | **$1,00 USD por pessoa/serviço** |
| Serviço fixo (1 unidade) | $1,00 |
| Serviço por pessoa × 7 | $7,00 |

**Mecanismo de cobrança:** split automático na transação via gateway (Mercado Pago Marketplace ou Stripe Connect). A assessoria conecta a própria conta do gateway — ao processar o pagamento, a plataforma retém $1/item e o restante vai direto para a assessoria, sem repasse manual.

---

## Integrações de Pagamento

| Gateway | Prioridade | Método |
|---|---|---|
| Mercado Pago | Principal (Brasil) | PIX + Cartão de crédito/débito |
| Stripe | Secundário (internacional) | Cartão |
| PIX nativo | Via MP ou Stripe | — |

A assessoria conecta a própria conta do gateway via OAuth no painel de Integrações. Sem conta conectada → checkout indisponível.

---

## Confirmação de Pagamento

**Para o cliente (tela + email):**
```
Pagamento confirmado ✅

Serviço: Consultoria DS-160 Completa
Pessoas: 2
Total pago: R$ 700,00

A assessoria entrará em contato em breve.
[Nome da Assessoria] — [email] — [WhatsApp]
```

**Para a assessoria (email + notificação no dashboard):**
```
Novo pagamento recebido

Cliente: João Silva (joao@email.com)
Serviço: Consultoria DS-160 Completa
Pessoas: 2
Valor: R$ 700,00
```

---

## Decisões abertas (a resolver na V2)

| Ponto | Opções |
|---|---|
| Conversão da taxa ($1 → R$) | Fixada (ex: R$ 6,00) ou flutuante pela cotação do dia |
| Reembolso | Política definida pela assessoria ou pela plataforma? |
| Cupom de desconto | Assessoria pode criar códigos promocionais? |
| Parcelamento | Cartão parcelado via Mercado Pago? |
| Recibo fiscal | NF ou apenas recibo simples? |

---

## Conexão com o restante do sistema

- **Hotpage** → botão "Contratar serviço" no link hub aponta para `/{org_slug}/checkout`
- **Dashboard** → seção "Serviços" para cadastro + histórico de vendas por assessoria
- **Integrações** → configuração do gateway (Mercado Pago / Stripe) em [integrations.md](./integrations.md)
- **Logs** → transações registradas com status (pago, falhou, reembolsado)
- **Organizations** → Master visualiza volume de transações e receita por organização
