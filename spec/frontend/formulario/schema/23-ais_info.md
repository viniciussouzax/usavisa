# Seção 23: `aisInfo` — Informações AIS e Agendamento

> ⚠️ **Seção da plataforma — não é parte do DS-160.** Não tem campos `ds160`. Consumida pelos actors `ais_cadastro_taxa` e `ais_agendamento`.

**Condicional de seção:** visível **apenas para o solicitante principal do caso** (`isGroupLead = true`).
**Posição:** após seção 22 (`additionalInfo`).

### Solicitante Principal

O solicitante principal é o membro designado como líder do caso — normalmente o primeiro cadastrado pelo assessor, mas pode ser alterado no Case Detail. É identificado pela flag `isGroupLead` no banco, não por campo do formulário.

Os demais membros do caso **nunca veem esta seção**. As informações de CASV e disponibilidade de datas preenchidas pelo principal orientam o agendamento de **todo o grupo**.

> **V2 — Patrocinador/Custeador:** a questão de quem financia a viagem de cada membro é tratada individualmente pelo campo `travel.whoIsPaying`. A criação de um papel formal de "patrocinador" — que pode ou não coincidir com o principal, e cujos dados podem ser herdados entre membros — está anotada para análise na V2. Ver `decisions_log.md`.

---

## Bloco 1 — Credenciais AIS

| id | label | type | req | notas |
|---|---|---|---|---|
| `hasAisAccount` | Já possui conta no portal AIS (usvisa-info.com)? | `radio` | ✅ | Y/N |
| `aisEmail` | Email da conta AIS | `email` | ✅ | `showWhen: hasAisAccount=Y`. maxLen:50. |
| `aisPassword` | Senha da conta AIS | `password` | ✅ | `showWhen: hasAisAccount=Y`. Armazenado criptografado. Nunca exposto em texto. |
| `newAccountEmail` | Email para criação da nova conta | `email` | — | `showWhen: hasAisAccount=N`. maxLen:50. allowNA. Hint: se deixado em branco, o actor gerará um email automático via addy.io. |

---

## Bloco 2 — Local do CASV

> Exibido apenas para postos consulares que exigem agendamento separado de biometria.
> **Oculto quando:** `location.location in [PTA, RCF]` (Porto Alegre e Recife — processo único no mesmo local).

| id | label | type | req | notas |
|---|---|---|---|---|
| `_casvHeading` | Agendamento CASV (Biometria) | `heading` | — | `showWhen: location.location notIn [PTA, RCF]` |
| `_casvOrientation` | Instrução sobre o CASV | `orientation` | — | `showWhen: location.location notIn [PTA, RCF]`. Texto: "Sua cidade de entrevista exige agendamento separado para coleta de biometria (CASV). Informe o posto CASV mais próximo de você e as datas em que pode comparecer." |
| `casvLocation` | Local do CASV | `select` | ✅ | `showWhen: location.location notIn [PTA, RCF]`. optionsRef: casvLocations. Hint: escolha o posto CASV mais próximo. |

### optionsRef: `casvLocations`

> ⚠️ Lista a confirmar com o portal AIS — pode haver postos adicionais ou alterações.

| value | label |
|---|---|
| `SP` | São Paulo |
| `RJ` | Rio de Janeiro |
| `BH` | Belo Horizonte |
| `BSB` | Brasília |

---

## Bloco 3 — Disponibilidade de Datas CASV

> Oculto nas mesmas condições do Bloco 2.

| id | label | type | req | notas |
|---|---|---|---|---|
| `casvAvailability` | Quando pode ir ao CASV? | `daterange` | ✅ | `showWhen: location.location notIn [PTA, RCF]`. Hint: informe o intervalo de datas em que você está disponível — o sistema buscará a melhor vaga dentro deste período. |
| `casvAvailabilityAlt` | Período alternativo para o CASV | `daterange` | — | `showWhen: location.location notIn [PTA, RCF]`. allowNA. Hint: opcional — informe um segundo período caso o principal não tenha vagas. |

---

## Bloco 4 — Disponibilidade de Datas da Entrevista

> Sempre visível — todos os postos têm entrevista consular.

| id | label | type | req | notas |
|---|---|---|---|---|
| `_interviewHeading` | Agendamento da Entrevista Consular | `heading` | — | — |
| `interviewAvailability` | Quando pode ir à entrevista? | `daterange` | ✅ | Hint: informe o intervalo de datas em que você está disponível para a entrevista no consulado. |
| `interviewAvailabilityAlt` | Período alternativo para a entrevista | `daterange` | — | allowNA. Hint: opcional — segundo período caso o principal não tenha vagas. |

---

## Regra de negócio: CASV separado vs. processo único

| Posto | value | Tem CASV separado? |
|---|---|---|
| Porto Alegre | `PTA` | ❌ — processo único |
| Recife | `RCF` | ❌ — processo único |
| São Paulo | `SPL` | ✅ |
| Rio de Janeiro | `RDJ` | ✅ |
| Brasília | `BRA` | ✅ |
| Outros postos | — | ✅ — assumir CASV separado por padrão |

---

## Tipo de Input: `daterange`

Novo tipo de input definido para esta seção. Ver especificação em `input_patterns.md`.

```
De  [Dia ▼] [Mês ▼] [Ano____]   até   [Dia ▼] [Mês ▼] [Ano____]
```

**Armazena:** `{ from: { day, month, year }, to: { day, month, year } }`

**Validações:**
- `from` não pode ser posterior a `to`
- Ambas as datas devem ser futuras (`notPast: true`)

---

## Como os actors consomem esta seção

| Actor | Campos consumidos | Uso |
|---|---|---|
| `ais_cadastro_taxa` | `hasAisAccount`, `aisEmail`, `aisPassword`, `newAccountEmail` | Decide se loga com conta existente ou cria nova |
| `ais_agendamento` | `casvLocation`, `casvAvailability`, `casvAvailabilityAlt` | Busca slot de CASV dentro do range informado |
| `ais_agendamento` | `interviewAvailability`, `interviewAvailabilityAlt` | Busca slot de entrevista dentro do range informado |
| `ais_monitoramento` | `casvAvailability`, `interviewAvailability` | Define janela de monitoramento de vagas |
| `ais_antecipacao` | ambos os ranges | Define limite aceitável para antecipação |
