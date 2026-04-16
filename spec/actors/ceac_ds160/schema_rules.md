# Diretrizes de Construção do Esquema (Schema Guidelines)

Este documento elenca as premissas arquiteturais que **devem ser consideradas** ao projetar ou estruturar a nossa camada de Dados/Esquema. O Esquema rege o estado da aplicação e as regras de negócio ("como capturar, estruturar, visualizar e invalidar dados do usuário") muito antes que o motor de automação atue.

## 1. Fonte Única de Verdade Compilada (Modularity & Build)
- **O que deve ter:** A arquitetura não deve exigir a manutenção de um dicionário colossal (ex: um arquivo único de milhares de linhas). O planejamento deve contemplar a separação das lógicas em módulos granulares por página ou domínio.
- **O Objetivo:** Ferramentas de build ou empacotamento devem ser consideradas para unificar esses módulos em um artefato que em tempo de execução dite as regras pontuais da UI.

## 2. Abstração de Elementos de Interface (UI via JSON)
- **O que deve ter:** O esquema deve ultrapassar a restrição de ser apenas um roteador de chaves de Banco de Dados. A estrutura de dados deve ter a capacidade de carregar componentes passivos (Ex: objetos do tipo `alert` com `alertStyle`).
- **O Objetivo:** Quando a interface do usuário ler o esquema, ela deve automaticamente renderizar os avisos estruturais (e.g. exigência antecipada de foto) sem demandar que os desenvolvedores codifiquem front-end manualmente para cada nova regra de visto imposta pelo governo.

## 3. Validação Pre-Flight (Fail-Fast)
- **O que deve ter:** A barreira de validação anti-ceac deve nascer no esquema e não no validador do robô.
- **O Objetivo:** Restrições absolutas de formulário (e.g. `maxLen: 33`, restrição a caracteres latinos ou pontuações dependendo do logiciador) devem ser representadas no esquema de forma universal para que o formulário do portal que o candidato preenche avise o erro no exato momento da digitação.

## 4. Árvores Condicionais Integradas
- **O que deve ter:** Nós lógicos de condição (arquiteturas orientadas a eventos como "Ocultar/Mostrar dependendo de X") devem existir nativamente dentro do esquema.
- **O Objetivo:** A aplicação que lê o schema deve ser capaz de instanciar ou apagar automaticamente fragmentos de payload inteiros quando a resposta mestre mudar, protegendo a automação de ingerir campos fantasmas ou enviar nós nulos.

## 5. Taxonomia de Tipos de Campo no fieldMap

Cada entrada no fieldMap deve declarar um `type` canônico que informa à engine qual estratégia de preenchimento aplicar. Os tipos reconhecidos são:

| Tipo | Elemento CEAC | Estratégia de Preenchimento |
|---|---|---|
| `click` | `<input type="radio">` | Clique direto — pode ou não disparar postback |
| `select` | `<select>` | Seleção por valor direto |
| `select-label` | `<select>` | Seleção por texto da opção (label) |
| `select-search` | `<select>` | Correspondência fuzzy (label exact → partial → value) |
| `radio` | `<input type="radio">` | Clique por sufixo `_0`/`_1` (Yes/No) |
| `checkbox-check` | `<input type="checkbox">` | Marca o checkbox se não marcado |
| `text` | `<input type="text">`, `<textarea>` | Injeção de texto — críticos com blur nativo, demais em batch |

## 6. Estrutura de Entradas DataList (`addAnother`)

Entradas de fieldMap que se referem a linhas de listas dinâmicas (DataLists) devem declarar uma propriedade `addAnother` com a estrutura:

```json
{
  "addAnother": {
    "list": "dtlNomeDaLista",
    "idx": 1
  }
}
```

- `list`: nome canônico da DataList no CEAC (ex: `dtlOTHER_NATL`, `DListAlias`)
- `idx`: índice da linha esperada (ex: `1` para `_ctl01_`, `2` para `_ctl02_`)

A engine verificará a existência da linha com o índice correspondente antes de clicar em "Add Another". Limite de segurança: máximo de 5 cliques por lista por passa.

---

## 7. Regras do Normalizer de Perfil

### 7.1 DS-160 Aceita Apenas ASCII — Regra Global
**Fato do CEAC:** O formulário DS-160 rejeita ou corrompe caracteres não-ASCII. Todos os valores de string do payload devem ter acentos e diacríticos removidos antes da injeção.

| Entrada | Saída esperada |
|---|---|
| `"João"` | `"Joao"` |
| `"Conceição"` | `"Conceicao"` |
| `"São Paulo"` | `"Sao Paulo"` |

Esta normalização deve ocorrer **antes** que qualquer valor chegue à engine de preenchimento — nunca dentro da engine.

### 7.2 Sentinela `'DNA'` — Does Not Apply
O valor de string `'DNA'` (case-sensitive) no payload bruto é um sentinela que equivale a `null` e significa "campo não se aplica". A engine jamais deve injetar a string literal `'DNA'` em qualquer campo do CEAC.

Valores que devem ser tratados como `null` (sentinelas canônicos do payload):
- `'DNA'`
- `'N/A'`
- `'n/a'`
- `null`
- `undefined`
- string vazia `''`

### 7.3 Dual-Key Support (camelCase e snake_case)
O schema de dados aceita campos em camelCase ou snake_case. Ambos os formatos devem ser suportados para o mesmo campo:

Exemplo: `givenName` e `given_name` são equivalentes.

A resolução de prioridade é: `camelCase` primeiro, `snake_case` como fallback.

### 7.4 Short-Circuit de Perfil Pré-Normalizado
Se o payload já contiver `surname` e `givenName` no nível raiz, assume-se que o perfil está pré-normalizado e é retornado sem processamento. Isso permite que a engine aceite perfis já processados sem overhead duplo.

### 7.5 Estrutura Modular — Mapeamento Seção→Normalizer
O normalizer é composto por 20 módulos, um por seção do formulário DS-160:

| Módulo | Seção |
|---|---|
| `01-location` | Localização (Landing page) |
| `02-personal1` | Dados Pessoais 1 |
| `03-personal2` | Dados Pessoais 2 |
| `04-travel` | Viagem |
| `05-travel-companions` | Acompanhantes de Viagem |
| `06-previous-us-travel` | Viagens Anteriores aos EUA |
| `07-address-phone` | Endereço e Telefone |
| `08-passport` | Passaporte |
| `09-us-contact` | Contato nos EUA |
| `10-family-parents` | Família — Pais |
| `11-family-spouse` | Família — Cônjuge |
| `12-deceased-spouse` | Cônjuge Falecido |
| `13-prev-spouse` | Cônjuges Anteriores |
| `14-work-education-current` | Trabalho/Educação — Atual |
| `15-work-education-previous` | Trabalho/Educação — Anterior |
| `16-work-education-additional` | Trabalho/Educação — Adicional |
| `17-security` | Segurança/Background |
| `18-student-exchange` | Estudante/Exchange (SEVIS) |
| `19a-student-add-contact` | Estudante — Contato Adicional |
| `19-petition-info` | Informações de Petição |

> O perfil final é um **objeto flat** resultante do merge sequencial de todos os módulos via `Object.assign`. A engine consome este objeto flat — não estruturas aninhadas por módulo.



## 8. Arquitetura do Esquema de Validação (Validation Schema)

O esquema frontal da aplicação (`public/ds160-schema.js`), usado para renderizar os formulários e executar validações *pre-flight* (conforme §3), opera através de uma compilação modular.

> **Princípio:** O arquivo monolítico nunca deve ser editado manualmente. Ele deve ser gerado através de uma rotina de build (ex: `build-schema.js`) que compila as definições fragmentadas dos módulos presentes em `pages/XX/schema.js`.

### 8.1 Ordem Estrita de Páginas (PAGE_ORDER)
O compilador do esquema une as seções modulares do DS-160 numa ordem estrita que determina tanto o fluxo de renderização do formulário quanto a sequência de preenchimento (`PAGE_ORDER`). 

A arquitetura pressupõe que novas páginas/etapas (como `19a-student-add-contact`, `20-preparer` ou `23-photo`) devem ser registradas neste array estrito (`PAGE_ORDER`) sempre que novos campos ou tipos de visto forem estendidos no front-end, garantindo a sincronia absoluta entre a ordem em que o robô navega e a ordem em que a UI valida e apresenta as etapas ao usuário.

### 8.2 Opções Compartilhadas (`_shared/options.js`)
O esquema também faz o mapeamento inverso das opções do CEAC (Ex: Códigos de países, listagem de profissões). Todas essas constantes de options dos dropdowns devem estar concentradas num único dicionário exportado pelas *opções compartilhadas*, que é inserido no tronco superior do esquema.

### 8.3 Tipos e Modificadores Permitidos no Schema UI
O formato final compilado reconhece canonicamente os seguintes contratos de construção de payload:

- **Tipos Suportados (`type`):** `text`, `select`, `radio`, `date`, `phone`, `email`, `textarea`, `array`
- **Modificadores de Validação (`modifiers`):**
  - `required`, `showWhen` (condicionais atreladas a triggers)
  - `maxLen`, `noSpecial`, `uppercase` (regras pre-flight imediatas)
  - `allowNA`, `allowUnknown` (geram botões de atalho/checkboxes que inserem os sentinelas definidos em §7.2)
  - `default`
