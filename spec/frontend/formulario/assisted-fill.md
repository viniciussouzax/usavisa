# Preenchimento Assistido — Spec Preliminar

> ⚠️ **V2 — INCOMPLETO. Necessita revisão antes de implementar.**
> Este documento mapeia o conceito e as intenções. Campos específicos, regras de precedência e comportamentos de UI precisam ser revisados e detalhados antes de qualquer implementação.

---

## Conceito

O formulário DS-160 tem muitos campos que o solicitante não sabe responder, que são idênticos para todos os membros de um grupo, ou que têm respostas recomendadas baseadas no contexto. O preenchimento assistido reduz o esforço do solicitante em três camadas:

```
Camada 1 — API Pull        → dados que já existem em fontes externas
Camada 2 — Herança         → dados de outro membro do mesmo caso
Camada 3 — Sugestão        → resposta recomendada baseada no contexto
```

As três camadas são não-obstrutivas: pré-preenchem o campo com um valor que o solicitante pode confirmar ou sobrescrever. Nenhuma bloqueia a edição.

---

## Camada 1 — API Pull

Dados puxados de fontes externas ao entrar na seção ou ao sair de um campo-gatilho.

### Gatilhos e fontes mapeados (⚠️ incompleto — revisar integrações disponíveis)

| Campo-gatilho | Fonte | Campos preenchidos |
|---|---|---|
| CPF | Receita Federal (API pública ou terceiro) | Nome completo, data de nascimento |
| CNPJ do empregador | Receita Federal | Nome da empresa, endereço, telefone |
| CEP residencial | BrasilAPI *(já implementado no engine)* | Rua, cidade, estado |
| Número do passaporte | *(fonte a definir — pode não existir)* | Validade, país emissor |

### Comportamento esperado
- Campo-gatilho perde o foco (`blur`) → dispara consulta
- Resposta da API → preenche campos correspondentes
- Falha ou sem resultado → campos ficam vazios, sem mensagem de erro ao usuário
- Campos preenchidos por API ficam visualmente marcados como "preenchido automaticamente"
- Solicitante pode editar qualquer campo preenchido pela API

### ⚠️ Pendências desta camada
- Definir quais APIs são viáveis (custo, disponibilidade, dados retornados)
- Definir política de cache (não repetir consulta para o mesmo CPF/CEP)
- Definir se o assessor também pode disparar o pull manualmente

---

## Camada 2 — Herança de Grupo

Dados copiados do solicitante titular para os demais membros do caso. Coberto em análise separada — ver discussão no contexto da V2 de Case Detail.

### Campos candidatos à herança (⚠️ incompleto — sujeito a revisão)

| Seção | Campos | Condição |
|---|---|---|
| `location` | `location` | Todos na mesma entrevista — sempre |
| `travel` | Datas, voos, cidades, locais nos EUA, hospedagem | Mesma viagem |
| `travel` | Dados completos do pagador | Mesmo pagador para toda a família |
| `usContact` | Todos os campos | Mesmo contato nos EUA |
| `addressPhone` | Endereço residencial | Apenas se morarem juntos |

### Comportamento esperado
- Assessor aplica herança do titular com um clique por campo ou por bloco
- Campos herdados ficam marcados visualmente como "herdado do titular"
- Qualquer membro pode sobrescrever o campo herdado — a sobrescrita remove a marcação
- Mudança no titular após herança aplicada: ⚠️ **comportamento a definir** — propagar automaticamente ou avisar?

### ⚠️ Pendências desta camada
- UI de aplicação da herança no Case Detail (assessor)
- Comportamento quando titular altera um campo já herdado
- Campos que NUNCA devem ser herdados (passaporte, dados pessoais, antecedentes)

---

## Camada 3 — Sugestão Contextual

Resposta recomendada quando o campo está vazio e existe uma sugestão baseada no contexto do caso.

### 3a — Fallback padrão quando não sabe

Campos onde a resposta mais comum é um valor padrão conhecido:

| Campo | Condição | Sugestão |
|---|---|---|
| `travel.usAddressStreet1` | Solicitante não tem endereço definido nos EUA | `"HOTEL"` |
| `travel.usAddressCity` | — | Cidade base da viagem (definida no caso) |
| `travel.usAddressState` | — | Estado correspondente à cidade base |
| `usContact.surname` / `organization` | Solicitante não tem contato nos EUA | Mesmo endereço do hotel |
| `travel.lengthOfStay` + `lengthOfStayUnit` | Sem data definida | Estimativa por tipo de visto *(a definir)* |

### 3b — Sugestão baseada em perfil

Respostas que dependem de dados já informados no formulário ou no perfil do caso:

| Contexto | Campo | Sugestão |
|---|---|---|
| Negativa de visto anterior registrada | Explicação da negativa | Sugestão baseada no motivo — ⚠️ **lógica a definir** |
| Tipo de visto B1/B2 turismo | Propósito da visita | Sugestão de texto padrão para turismo |
| Tipo de visto F1 | Propósito da visita | Sugestão de texto para estudo |

### 3c — Resposta recomendada por política

Campos onde a resposta correta para a maioria dos casos é conhecida:

| Campo | Resposta recomendada | Observação |
|---|---|---|
| Todos os campos de `security` | `N` (Não) | Já está implementado como `default: "N"` no schema |

### Comportamento esperado
- Campo vazio ao ser exibido → sugestão aparece como valor pré-preenchido em estado visual diferenciado (ex: itálico ou cor distinta)
- Solicitante edita → campo assume estado normal
- Solicitante não edita e avança → valor da sugestão é aceito e salvo normalmente
- A sugestão não bloqueia validação — se o campo é obrigatório e a sugestão é vazia, ainda valida como vazio

### ⚠️ Pendências desta camada
- Definir de onde vem a "cidade base da viagem" — campo no caso ou no formulário?
- Lógica de sugestão para negativas anteriores — requer análise do motivo e texto recomendado
- Definir se sugestões são configuráveis pela assessoria ou fixas na plataforma
- Definir se assessor pode criar sugestões customizadas por caso

---

## Precedência entre camadas

Quando mais de uma camada tenta preencher o mesmo campo:

```
API Pull > Herança > Sugestão
```

Se API Pull retornou um valor → herança e sugestão não sobrescrevem.
Se herança foi aplicada → sugestão não sobrescreve.

> ⚠️ **A definir:** comportamento quando o solicitante apaga um valor preenchido por API Pull — a sugestão entra como fallback ou o campo fica vazio?

---

## O que NÃO recebe preenchimento assistido

- Campos de `security` — todos são `default: "N"` no schema, o que já é suficiente. Sugestão adicional não se aplica.
- Dados pessoais (`personal1`, `personal2`) — individuais por natureza, sem fonte externa confiável para a maioria
- Histórico de viagens anteriores — não há fonte para puxar
- Dados de trabalho/educação além do CNPJ do empregador atual

---

## Próximos passos para finalizar esta spec (⚠️ antes de implementar)

1. Validar quais APIs de CPF/CNPJ são viáveis no contexto brasileiro (custo, LGPD, confiabilidade)
2. Definir a "cidade base da viagem" como campo do caso no dashboard
3. Revisar a lógica de sugestão para negativas anteriores — requer mapeamento dos motivos possíveis
4. Definir UI de marcação visual para campos preenchidos por cada camada
5. Definir comportamento de propagação quando titular altera campo já herdado
6. Revisar se assessoria pode customizar sugestões por caso ou por organização
