# Framework de Inputs — 3 Camadas

---

## Modelo Mental

Antes de qualquer detalhe, o modelo inteiro em uma linha:

```
Input → Block → Question → Array → Section
```

| Peça | Responsabilidade | Tem lógica? |
|---|---|---|
| **Input** | Coletar um dado. Só isso. | Não |
| **Block** | Agrupar inputs com estrutura reutilizável | Não |
| **Question** | Definir quando algo aparece e o que abre | Sim |
| **Array** | Repetir um Block ou Question | Não |
| **Section** | Organizar o fluxo, agrupar Questions | Não |

### Regra de separação (nunca violar)

- **Block nunca decide lógica** — só recebe configuração (prefixo de chave, país padrão, etc.)
- **Question nunca define UI interna** — a aparência é responsabilidade do Input e do Block
- **Array só envolve** — não adiciona campos próprios, não tem lógica interna

Misturar essas responsabilidades é a origem de todos os bugs clássicos de formulários complexos: condicionais quebrando, arrays virando gambiarra, blocos difíceis de reutilizar.

---

## Camada 1 — Inputs Atômicos

A unidade mínima. Coleta um dado, sem dependências, sem sub-níveis.

### `text`
```
[_________________________________]
```
- Uppercase + strip de acentos a cada keystroke
- `maxLen` limita caracteres; `noSpecial` bloqueia caracteres especiais

**Armazena:** `string`

---

### `number`
```
[_____]
```
- Só dígitos. Sem máscara, sem formatação.

**Armazena:** `string` numérica

---

### `email`
```
[_________________________________]
```
- Não sofre uppercase. Validação de formato ao sair do campo.

**Armazena:** `string`

---

### `phone` (sempre com DDI)
```
[🇧🇷 +55 ▼] [(__) _____-____]
```
- DDI é parte inseparável — nunca um campo de telefone sem seletor de país
- `phoneCountry` define o país padrão; `phoneLocked: true` trava o seletor

**Armazena:** `string` com DDI incluso

---

### `select`
```
[Opção selecionada              ▼]
```
- Não sofre uppercase
- `optionsRef` aponta para lista global; `options` define lista inline
- `default` aplica valor inicial sem sobrescrever dado salvo

**Armazena:** `string` (o value da opção)

---

### `radio`
```
● Sim   ○ Não
```
- Não sofre uppercase. Padrão binário: `"Y"` / `"N"`
- Pode ter mais opções quando `options` define lista própria

**Armazena:** `string`

---

### `date`
```
[Dia ▼] [Mês ▼] [Ano________]
```
- Três partes obrigatórias juntas — não existe data parcial
- `notFuture: true` bloqueia datas posteriores a hoje

**Armazena:** `{ day: string, month: string, year: string }`

---

### `daterange`
```
De  [Dia ▼] [Mês ▼] [Ano________]   até   [Dia ▼] [Mês ▼] [Ano________]
```
- Dois campos `date` vinculados: `from` e `to`
- `notPast: true` — ambas as datas devem ser futuras (oposto de `notFuture`)
- `from` não pode ser posterior a `to`
- Usado para capturar janelas de disponibilidade (ex: agendamento CASV, entrevista)

**Armazena:** `{ from: { day, month, year }, to: { day, month, year } }`

---

### `textarea`
```
[                                  ]
[                                  ]
```
- Mesmas regras do `text`. `maxLen` limita total de caracteres.

**Armazena:** `string`

---

### `ssn`
```
[___] — [__] — [____]
```
- Formato fixo XXX-XX-XXXX. Sempre acompanhado de `allowNA`.

**Armazena:** `{ p1: string, p2: string, p3: string }`

---

### `file`
```
[  Selecionar arquivo  ]  →  preview após upload
```
- Valida formato e tamanho. Armazena URL, não o arquivo.

**Armazena:** `string` (URL)

---

### Modificadores (aplicam a qualquer atômico)

| Modificador | Efeito |
|---|---|
| `required` | Obrigatório para validação e progresso |
| `allowNA` | Exibe checkbox "Não se aplica" → ao marcar: desabilita inputs + armazena `"DNA"` → passa na validação |
| `allowUnknown` | Exibe checkbox "Não sei" → ao marcar: desabilita inputs + armazena `"UNKNOWN"` → passa na validação |
| `inline` | Renderiza lado a lado com o próximo campo inline |
| `hint` | Texto de orientação abaixo do label |

**Comportamento de UI — contrato obrigatório para `allowNA` e `allowUnknown`:**

```
[ ] Não se aplica          [ ] Não sei

Quando marcado:
  1. Todos os inputs do campo ficam visualmente desabilitados (disabled + cinza)
  2. O valor salvo no estado é "DNA" ou "UNKNOWN"
  3. A validação de `required` é satisfeita pelo marcador
  4. Desmarcar restaura os inputs e limpa o marcador

Regras adicionais:
  - allowNA e allowUnknown podem coexistir no mesmo campo
  - Marcar um desmarca o outro automaticamente (são mutuamente exclusivos)
  - O campo desabilitado permanece visível — serve como confirmação visual
    de que o usuário fez uma escolha consciente, não deixou em branco
```

**Importante:** Os campos não somem — eles ficam visivelmente inativos. O usuário vê que aquele dado foi marcado como não aplicável, o que é diferente de simplesmente não preencher.

---

## Camada 2 — Blocos Reutilizáveis

Conjuntos de inputs com estrutura fixa que se repetem com chaves diferentes. Implementados uma vez, instanciados em qualquer ponto. **Sem lógica própria — só estrutura.**

### Bloco: Endereço
```
País/Região          [Select ▼]

[se Brasil]                        [se outro país]
  CEP        [_____-___]             Código Postal  [___________]
  Estado     [UF ▼]                 Estado/Prov.   [___________]

Endereço (Linha 1)   [________________________________]
Endereço (Linha 2)   [________________________________]  opcional
Cidade               [____________________]
```

A lógica de Brasil vs. outros países é **configuração do bloco**, não lógica do bloco:
- CEP brasileiro: consulta BrasilAPI ao sair do campo com 8 dígitos → preenche Endereço, Cidade, Estado
- Anti-loop: mesmo CEP não dispara segunda consulta
- Falha silenciosa: se API errar, nenhum campo é alterado

**Instâncias no DS-160:** residencial (`home`), correspondência (`mail`), cônjuge (`spouse`), pagador (`payer`), empregador (`employer`), contato nos EUA (`usContact`)

---

### Bloco: Nome Completo
```
Sobrenome   [________________________________]
Nome        [________________________________]
```
- Ambos `text`, uppercase, `noSpecial`
- Separados porque o padrão consular distingue Surname dos Given Names

**Instâncias:** solicitante, cônjuge, pai, mãe, ex-cônjuge, acompanhante, contato

---

### Bloco: Telefone
Qualquer coleta de telefone usa o atômico `phone` — nunca `text`.
```
[🌐 DDI ▼] [número]
```
**Instâncias:** principal, secundário, comercial, pagador, empregador, contato nos EUA (com `phoneLocked`)

---

### Bloco: Data de Nascimento
Instância do atômico `date` com `notFuture: true`.

**Instâncias:** solicitante, cônjuge, pai, mãe, ex-cônjuges

---

## Camada 3 — Tipos de Pergunta

Como as perguntas se organizam. Usam os Inputs da Camada 1 e os Blocos da Camada 2.

---

### Tipo 1 — Simples
Uma pergunta, uma resposta. Sem sub-níveis, sem dependências.

```
Label
[input ou bloco]
```

**Exemplos:** Nome, Sobrenome, Email, Telefone principal, Data de nascimento.

---

### Tipo 2 — Condicional
Uma pergunta cujo valor **abre ou fecha** um sub-nível.

```
Pergunta?   ● SIM   ○ NÃO
            └──────────────────────────────────┐
              [sub-nível]                       │ aparece se SIM
              pode ter Tipo 1, Tipo 2 ou Array  │ some se NÃO
            └──────────────────────────────────┘
```

**Gatilhos possíveis:**
- `radio` Sim/Não — o mais comum
- `select` — valor específico abre sub-nível
- `select` — valores diferentes abrem sub-níveis diferentes

**O sub-nível é recursivo** — pode conter outra Question Condicional, sem limite de profundidade:

```
Viajou com outros?  ● SIM
└─ Faz parte de um grupo?  ● SIM
   └─ Nome do grupo: [___]
```

**Regra absoluta:** quando o sub-nível some, **todos os dados dentro dele são apagados** — do estado e do banco — imediatamente. Recursivo: dados de condicionais dentro do sub-nível também são apagados.

---

### Tipo 2 Bifurcado — Cada Resposta Abre um Sub-nível Diferente

Variação onde **toda resposta possível tem seu próprio sub-nível**. Não existe "sem bloco" — trocar a seleção purga o bloco anterior e abre o novo.

```
Pergunta?   ● SIM              ○ NÃO
            └─────────────┐    └─────────────┐
              [Bloco A]   │      [Bloco B]   │  blocos diferentes
            └─────────────┘    └─────────────┘
```

**Com select (N valores → N blocos):**
```
[Opção ▼]
  ├── Opção A → Bloco A  ←  purga B e C ao selecionar
  ├── Opção B → Bloco B  ←  purga A e C ao selecionar
  └── Opção C → Bloco C  ←  purga A e B ao selecionar
```

**Regra de limpeza:** ao trocar de opção, o bloco que estava visível é **purgado primeiro** (todos os dados apagados, condicionais internas fechadas), depois o novo bloco é exibido.

**Exemplos reais:**
- Plano de viagem: `hasSpecificPlans = Y` → bloco de datas/locais exatos / `= N` → bloco de data aproximada + duração estimada
- Pagamento: `whoIsPaying = SELF` → sem bloco / `= OTHER_PERSON` → bloco com nome, relação, endereço / `= COMPANY` → bloco com empresa e telefone
- Ocupação: `employed` → bloco de empregador / `student` → bloco de escola / `retired` → bloco mínimo (só data)

**Diferença do Tipo 2 padrão:**
- Tipo 2: uma resposta abre sub-nível, a outra não mostra nada
- Tipo 2 Bifurcado: cada resposta abre um sub-nível diferente — nunca fica sem bloco

---

### Tipo 2 + Array — Condicional que revela Repetição

Variação do Tipo 2 onde o sub-nível é uma lista de blocos repetíveis. A lista começa **vazia** — o usuário adiciona todos os blocos manualmente.

```
Pergunta?   ● SIM   ○ NÃO
            └──────────────────────────────────────┐
              ┌─ Bloco 1 ──────────────────── [✕] ─┐│
              │  [campos]                           ││
              └────────────────────────────────────┘│
              ┌─ Bloco 2 ──────────────────── [✕] ─┐│
              │  [campos]                           ││
              └────────────────────────────────────┘│
              [+ Adicionar]                          │
            └──────────────────────────────────────┘
```

**Exemplos reais:**
- `hasBeenInUS = Y` → array de viagens anteriores
- `otherNamesUsed = Y` → array de outros nomes
- `travelingWithOthers = Y` → array de acompanhantes
- `hasUSVisa = Y` → campos fixos + array de vistos perdidos

Ao mudar para NÃO: **todas as entradas do array são apagadas**.

---

### Tipo 2 + Bloco Obrigatório + Adicionar Mais

Variação onde selecionar SIM **instancia automaticamente o primeiro bloco**. Esse bloco é obrigatório — não tem botão de remover. Blocos adicionais são opcionais e adicionados pelo usuário.

```
Pergunta?   ● SIM   ○ NÃO
            └──────────────────────────────────────┐
              ┌─ Bloco 1 [obrigatório] ────────────┐│
              │  [campos — podem ter condicionais]  ││
              └────────────────────────────────────┘│
              ┌─ Bloco 2 ──────────────────── [✕] ─┐│  ← adicionado pelo usuário
              │  [campos]                           ││
              └────────────────────────────────────┘│
              [+ Adicionar outro]                    │
            └──────────────────────────────────────┘
```

**Diferença do Tipo 2 + Array:**
- Tipo 2 + Array → lista começa vazia; todos os blocos são adicionados manualmente
- Tipo 2 + Bloco Obrigatório → primeiro bloco abre automaticamente ao selecionar SIM; é obrigatório (sem `[✕]`)

**Exemplos reais:**
- `hasOtherPassports = Y` → primeiro documento obrigatório + adicionar mais
- `hasPreviousJobs = Y` → primeiro emprego obrigatório + adicionar mais

**Regra de limpeza:** ao selecionar NÃO, **todos os blocos — incluindo o primeiro — são apagados**.

---

### Array Incondicional — Repetição Direta na Seção

Array que sempre aparece, sem gatilho. A pergunta é implícita na própria lista.

```
┌─ Bloco 1 ──────────────────────── [✕] ─┐
│  [campos]                               │
└─────────────────────────────────────────┘
[+ Adicionar]
```

**Exemplos reais:** idiomas falados, países visitados, organizações, serviço militar.

---

### Regras do Array (valem para qualquer variação)

| Regra | Comportamento |
|---|---|
| Adicionar | Só permite se o bloco atual estiver completo |
| Remover | Apaga o bloco e re-indexa os restantes |
| `maxEntries` | Limite máximo (padrão: 5) |
| `minEntries` | Mínimo para a seção ser válida |
| Opção "Nenhum" | Primeiro bloco pode declarar "NENHUM" — bloqueia adição de mais |
| Condicionais internas | Cada bloco avalia suas próprias condicionais de forma independente |

---

## Mapa Completo

```
CAMADA 1 — Input Atômico
  text · number · email · phone(+DDI) · select · radio
  date · textarea · ssn · file
  + modificadores: required · allowNA · allowUnknown · inline · hint

      ↓  compõem

CAMADA 2 — Bloco Reutilizável
  Endereço  ·  Nome Completo  ·  Telefone  ·  Data de Nascimento

      ↓  organizam-se em

CAMADA 3 — Tipo de Pergunta
  Tipo 1: Simples                     →  input ou bloco, sem dependências
  Tipo 2: Condicional                 →  gatilho + sub-nível; a outra resposta não mostra nada
  Tipo 2 Bifurcado                    →  cada resposta abre um sub-nível diferente; trocar purga
  Tipo 2 + Array                      →  condicional que revela lista; blocos todos opcionais
  Tipo 2 + Bloco Obrigatório + Mais   →  condicional que abre 1º bloco automaticamente + adicionar
  Array Incondicional                 →  lista sempre visível, sem gatilho
```

**Qualquer campo do schema DS-160 = 1 atômico + 0–1 bloco + 1 tipo de pergunta.**
