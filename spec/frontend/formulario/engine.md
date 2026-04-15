# Form Engine: Arquitetura e Lógica Funcional

Especificação comportamental do motor de formulário. Nada aqui é visual ou de implementação — apenas regras que definem **o que o sistema deve fazer**.

---

## 1. Modelo de Estado

O engine mantém três objetos de dados principais, separados por tipo:

| Objeto | Conteúdo |
|---|---|
| `data` | Todos os campos não-array. Chave: `secId.fieldId` |
| `arrayData` | Campos de repetição. Chave: `secId.arrayId[idx].subFieldId` |
| `visitedSections` | Set de IDs de seção que o usuário já acessou |
| `naFields` | Set de chaves marcadas como N/A pelo usuário |
| `unknownFields` | Set de chaves marcadas como "Não sei" pelo usuário |
| `_isHydrating` | Flag que suprime auto-save durante carga inicial de dados |

### Marcadores Internos de Dado Especial

- **`"DNA"`** — valor armazenado quando o usuário escolhe "N/A" num campo `allowNA`. Preservado no JSON de saída.
- **`"UNKNOWN"`** — valor armazenado quando o usuário escolhe "Não sei" num campo `allowUnknown`. Preservado no JSON de saída.
- Esses marcadores **nunca são apagados** pelo prune-on-hide (são intencionais).

### Convenção de Chaves

```
Campo regular:      "personal1.surname"
Sub-campo de array: "previousTravel.trips[0].arrivalDate"
Campo de data:      "personal1.dob"  →  data: { day, month, year }
Campo de SSN:       "security.ssn"   →  data: { p1, p2, p3 }
```

---

## 2. Lógica Condicional (`showWhen`)

### Avaliação
Disparada em:
1. Todo evento de input do usuário
2. Carga inicial da página
3. Após carregamento de dados salvos (`_reEvaluateAllConditionals`)

### Prune-on-Hide (Regra Mais Crítica)
Quando um campo ou seção é ocultado por falhar na condição `showWhen`, o sistema **obrigatoriamente**:
1. Remove os valores de todos os inputs internos.
2. Deleta as chaves correspondentes de `data`.
3. Para arrays: localiza entradas via `data-array-key` e deleta de `arrayData`.
4. Avalia recursivamente sub-dependências (condicionais encadeados).
5. Define `dataChanged = true` e dispara auto-save imediato — o banco é purgado junto com a UI.

### Post-Render Sync (`_reEvaluateAllConditionals`)
Após carregar dados salvos, uma segunda passagem força o DOM a sincronizar com o estado interno. Itera por todos os campos, incluindo sub-campos de arrays. Necessário porque dados podem ser carregados antes do DOM estar completo — resolve bugs de "dado carregado mas campo oculto".

---

## 3. Gerenciamento de Arrays

### Estrutura
- Arrays são isolados em `arrayData`, separados de `data`.
- Cada entrada é identificada por índice numérico.
- Sub-campos obrigatórios dentro de arrays contribuem para o progresso e validação da seção.

### Normalização na Carga
Ao carregar dados salvos, strings soltas encontradas em `arrayData` são convertidas automaticamente para objetos `{}`. Isso garante compatibilidade com dados salvos em formato legado.

### Validação Antes de Adicionar
Antes de permitir uma nova entrada no array, o sistema **valida a última entrada existente**. Se houver campos obrigatórios vazios na última entrada, a adição é bloqueada e o erro é reportado ao usuário.

### `noneOnlyFirstEntry`
Arrays com esta flag permitem que a primeira entrada selecione "NENHUM". Quando "NENHUM" é selecionado, adição de novas entradas é bloqueada.

### Chave de Resolução de Valor
Um helper unificado resolve valores de forma transparente por tipo:
- Campo regular → busca em `data[key]`
- Padrão `arrayId[idx].subId` → busca em `arrayData[arrayId][idx][subId]`

---

## 4. Pipeline de Sanitização de Texto

Aplicado em todo input de texto durante a digitação (campos de texto, não selects):

1. **Strip de acentos** — caracteres acentuados são convertidos para equivalentes ASCII.
2. **Normalização de aspas** — aspas tipográficas (`"`, `"`, `'`, `'`) convertidas para ASCII reto.
3. **Uppercase** — todo o texto convertido para maiúsculas.

A ordem importa: sempre strip → normalização → uppercase.

**Exceções**: campos de email e senha não sofrem uppercase.

---

## 5. Auto-preenchimento de CEP (Brasil)

**Trigger**: campo cuja chave termina em `PostalCode` E país selecionado no mesmo bloco é `BRZL`.

**Fonte**: `https://brasilapi.com.br/api/cep/v1/{cep}` — chamada ao perder o foco (`blur`) após 8 dígitos.

**Campos preenchidos**: `address1`, `city`, `state` — mapeados da resposta da API.

**Anti-loop**: após preencher automaticamente, o engine cacheia o CEP que disparou o preenchimento. Novos `blur` com o mesmo CEP não fazem nova chamada.

**Falha silenciosa**: se a API retornar erro, nenhum campo é alterado.

---

## 6. Padrão País → Campos de Endereço

**Gatilho**: mudança no campo cuja chave termina em `Country` (ou `Cntry`).

**Comportamento**:
- Se o país selecionado é `BRZL` (Brasil): exibe campo de CEP, exibe estado como select filtrado por UF brasileiras.
- Outros países: exibe campo de código postal genérico, exibe estado como texto livre.
- **PostalCode e State** ficam ocultos até que um país seja selecionado.

O prefixo do bloco de endereço é derivado automaticamente da chave do campo Country por convenção de nomenclatura.

---

## 7. Padrão SameAddress

**Gatilho**: campo cuja chave termina em `SameAddress`.

**Comportamento**:
- `SameAddress = "Y"`: bloco de endereço associado fica oculto (prune-on-hide se aplica).
- `SameAddress = "N"`: bloco de endereço é exibido para preenchimento.

O prefixo do bloco de endereço é derivado da chave `SameAddress` por convenção.

---

## 8. Detecção de Menor de Idade

**Cálculo**: baseado no campo `personal1.dob` (data de nascimento).

**Regra**: se o solicitante tem menos de 14 anos na data do formulário, as seções `workEducation1`, `workEducation2` e `workEducation3` são **ocultadas permanentemente** — sem exibir opção de preenchimento.

**Avaliado**: a cada mudança de `dob` e na carga inicial.

---

## 9. Critérios de Conclusão de Seção

Uma seção é marcada como completa (✅) **somente se todas as três condições forem verdadeiras**:

1. **`visitedSections`** contém o ID da seção — o usuário navegou até ela ao menos uma vez.
2. **Zero erros de validação** — `validateSection()` retorna lista vazia (inclui sub-campos obrigatórios de arrays ativos).
3. **`hasRequiredData === true`** — ao menos um campo obrigatório e visível tem conteúdo. Para seções exclusivamente de array: ao menos um item com todos os sub-campos obrigatórios preenchidos.

**Proteção de Default**: valores `default` do schema são aplicados **somente se o campo estiver vazio**. Re-renders não sobrescrevem respostas já salvas pelo usuário.

---

## 10. Regras de Validação de Campo

| Tipo de Campo | Regra |
|---|---|
| `email` | Regex padrão de email válido |
| `notFuture: true` | Data não pode ser maior que a data atual |
| `excludeField` | Dois campos mutuamente exclusivos — se um tem valor, o outro deve estar vazio |
| Campos numéricos | Apenas dígitos; sem espaços ou caracteres especiais |
| Campos de nome | Sem dígitos; apenas letras e hifens |
| Campos obrigatórios | Não vazios após trim |

Campos com `allowNA` ou `allowUnknown` passam na validação se o marcador interno (`"DNA"` / `"UNKNOWN"`) estiver presente.

---

## 10a. Estratégia de Validação de Campo — Reward Early, Punish Late

O momento do disparo de validação depende do histórico do campo — não é uniforme:

| Estado do campo | Trigger de validação |
|---|---|
| **Novo** — nunca recebeu foco | Apenas no `blur` (ao sair do campo) |
| **Com erro anterior** — já foi invalidado ao menos uma vez | No `input` (tempo real, enquanto o usuário corrige) |
| **Já completo** — tinha valor válido e o usuário voltou a editar | No `blur` ao terminar a edição |

**Implementação:** flag `hasBeenInvalidated` por campo. Enquanto falsa: listener de `blur`. Quando a validação falha pela primeira vez, a flag vira `true` e o listener muda para `input`.

**Objetivo:** nunca exibir erro antes do usuário ter a chance de preencher o campo. Mas exibir feedback imediato quando ele está ativamente corrigindo um erro conhecido.

---

## 11. Auto-save e Persistência

| Mecanismo | Trigger | Debounce |
|---|---|---|
| **Auto-save** | `onChange(key, val)` chamado a cada input | **1,5 segundos** após último evento |
| **Navigation save** | `goNext()` — antes de trocar de seção | Imediato (sem debounce) |
| **Exit save** | `visibilitychange` (estado `hidden`) + `beforeunload` | Imediato |

`_isHydrating = true` durante carga de dados — suprime todos os disparos de `onChange` para evitar salvar dados não-modificados.

---

## 12. Modos de Renderização e Navegação

### Modos de Display

| Modo | Comportamento |
|---|---|
| `'pages'` | Uma seção visível por vez. Navegação via botões Anterior/Próximo. |
| `'accordion'` | Todas as seções visíveis, colapsadas/expandidas. Clique no header da seção abre/fecha. |

### Regras de Navegação por Role

**Solicitante** (sem auth token):
- Modo `'pages'` por padrão.
- `goNext()` bloqueia avanço se a seção atual tiver erros de validação.

**Assessor** (com auth token):
- Modo `'accordion'` por padrão na view de Revisão.
- Pode navegar livremente entre seções sem bloqueio de validação.
- Edição inline disponível na view de Revisão.

### Parâmetros de URL

| Parâmetro | Valor | Comportamento |
|---|---|---|
| `tab` | `assessor` | Abre view de Revisão (accordion) |
| `tab` | `editar` | Abre view de Solicitante com privilégios de assessor |
| `tab` | `code` | Abre view de JSON |
| `tab` | *(ausente)* | Padrão: view de preenchimento (Solicitante) |
| `embedded` | `1` | Oculta navegação e header; modo iframe/drawer |
| `secure_entry` | token | Valida sessão do solicitante; evita acesso direto por URL |

---

## 13. Estrutura do JSON de Saída

```json
{
  "personal1": {
    "surname": "SILVA",
    "givenName": "JOAO"
  },
  "previousTravel": {
    "trips": [
      { "arrivalDate": { "day": "01", "month": "01", "year": "2020" } }
    ]
  },
  "_meta": {
    "visitedSections": ["personal1", "personal2", "travel"],
    "naFields": ["personal1.otherNames"],
    "unknownFields": ["security.ssn"]
  }
}
```

**Regras de output**:
- Campos ocultos por `showWhen` **não aparecem no JSON** (prune-on-hide garante isso).
- `"DNA"` e `"UNKNOWN"` são preservados como valores literais.
- `_meta` sempre presente; contém estado de navegação e marcadores especiais.
- Datas compostas saem como objeto `{ day, month, year }`.
- SSN sai como objeto `{ p1, p2, p3 }`.

---

## 14. Fluxo de Finalização

1. Valida **todas** as seções — não apenas a atual.
2. Se houver erros: exibe resumo com lista de campos faltantes por seção. Interrompe.
3. Se válido:
   - Salva dados via `saveData()`.
   - Emite PATCH no registro do solicitante: `{ stage: 'ds160', status: 'todo' }`.
   - Dispara callback `onFinalize`.
   - Registra evento em `formLog`.

---

## 15. FormLog (Rastreamento de Eventos)

Eventos críticos são persistidos na tabela `form_logs` do Supabase.

| Campo | Conteúdo |
|---|---|
| `applicant_id` | UUID do solicitante |
| `event` | Tipo do evento (ex: `'section_complete'`, `'finalize'`, `'validation_error'`) |
| `payload` | JSON com contexto do evento |
| `created_at` | Timestamp da ocorrência |

Usado para auditoria, debug remoto e rastreamento de progresso.

---

## 16. Accordion de Revisão (Assessor) — Persistência de Estado

Durante re-renders da view de Revisão (ex: após edição inline), o engine:
1. Salva o índice 0-based da seção expandida antes de re-renderizar.
2. Re-renderiza com `autoOpen = false`.
3. Re-expande a seção pelo índice salvo após o render.

**Por índice, não por label** — labels mudam dinamicamente (ex: percentuais de progresso).

---

## 17. Accordion de Seções — Binding de Eventos

Handlers de click de seções devem ser declarados via binding direto no HTML (`onclick="engine.toggleSection(idx)"`), não via `addEventListener` aplicado após render. Isso evita acúmulo de handlers duplicados em re-renders dinâmicos que causariam "double-toggle" (abrir e fechar instantaneamente num único clique).
