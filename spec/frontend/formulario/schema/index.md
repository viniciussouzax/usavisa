# DS-160 Schema — Índice e Convenções

Fonte de verdade dos campos, condicionais e arrays do formulário DS-160.
Gerado a partir de `ds160-schema.js` (fonte canônica — não editar o schema manualmente).

> **Escopo atual da plataforma:** vistos **B, F, J, O** apenas. Seções condicionais por tipo de visto devem ser implementadas e testadas apenas para esses tipos. Outros tipos de visto (M, H, L, P, Q, R, etc.) estão fora do escopo.

> **Lógica de roteamento entre páginas** (quando cada seção aparece baseada no tipo de visto, estado civil, idade): consultar [`actors/ceac_ds160/navigation_rules.md`](../../../actors/ceac_ds160/navigation_rules.md)

---

## Seções do Formulário

| # | Arquivo | id | label | Condicional de Seção | Escopo |
|---|---|---|---|---|---|
| 1 | [01-location.md](./01-location.md) | `location` | Local da Entrevista | — | ✅ B/F/J/O |
| 2 | [02-personal1.md](./02-personal1.md) | `personal1` | Informações Pessoais 1 | — | ✅ B/F/J/O |
| 3 | [03-personal2.md](./03-personal2.md) | `personal2` | Informações Pessoais 2 | — | ✅ B/F/J/O |
| 4 | [04-travel.md](./04-travel.md) | `travel` | Viagem | — | ✅ B/F/J/O |
| 5 | [05-travel_companions.md](./05-travel_companions.md) | `travelCompanions` | Acompanhantes de Viagem | — | ✅ B/F/J/O |
| 6 | [06-previous_travel.md](./06-previous_travel.md) | `previousUSTravel` | Viagens Anteriores aos EUA | — | ✅ B/F/J/O |
| 7 | [07-address_phone.md](./07-address_phone.md) | `addressPhone` | Endereço e Telefone | — | ✅ B/F/J/O |
| 8 | [08-passport.md](./08-passport.md) | `passport` | Passaporte | — | ✅ B/F/J/O |
| 9 | [09-us_contact.md](./09-us_contact.md) | `usContact` | Contato nos EUA | — | ✅ B/F/J/O |
| 10 | [10-family1.md](./10-family1.md) | `family1` | Família - Pais | — | ✅ B/F/J/O |
| 11 | [11-family2_spouse.md](./11-family2_spouse.md) | `family2` | Família - Cônjuge/Parceiro(a) | `personal1.maritalStatus in [M, C, L, U]` | ✅ B/F/J/O |
| 12 | [12-deceased_spouse.md](./12-deceased_spouse.md) | `deceasedSpouse` | Cônjuge Falecido | `personal1.maritalStatus = W` | ✅ B/F/J/O |
| 13 | [13-prev_spouse.md](./13-prev_spouse.md) | `prevSpouse` | Ex-Cônjuge | `personal1.maritalStatus = D` | ✅ B/F/J/O |
| 14 | [14-work_education1.md](./14-work_education1.md) | `workEducation1` | Trabalho/Educação - Atual | Oculto se `personal1.dob` < 14 anos | ✅ B/F/J/O |
| 15 | [15-work_education2.md](./15-work_education2.md) | `workEducation2` | Trabalho/Educação - Anterior | Oculto se `personal1.dob` < 14 anos | ✅ B/F/J/O |
| 16 | [16-work_education3.md](./16-work_education3.md) | `workEducation3` | Trabalho/Educação - Adicional | Oculto se `personal1.dob` < 14 anos | ✅ B/F/J/O |
| 17 | [17-security.md](./17-security.md) | `security` | Segurança e Antecedentes | — | ✅ B/F/J/O |
| 18 | [18-student_exchange_sevis.md](./18-student_exchange_sevis.md) | `studentExchange` | Informações SEVIS | `travel.purposeCategory in [F, J]` | ✅ F/J |
| 19 | [19-student_add_contact.md](./19-student_add_contact.md) | `studentAddContact` | Contatos Adicionais (Estudante) | `travel.purposeOfTrip in [F1-F1, J1-J1]` | ✅ F/J |
| 20 | [20-temporary_work.md](./20-temporary_work.md) | `temporaryWork` | Informações de Trabalho Temporário | `travel.purposeCategory = O` | ✅ O |
| 21 | [21-photo.md](./21-photo.md) | `photo` | Foto do Solicitante | — | ✅ B/F/J/O |
| 22 | [22-additional_info.md](./22-additional_info.md) | `additionalInfo` | Informações Adicionais do Caso | — ⚠️ Plataforma (não DS-160) | ✅ B/F/J/O |
| 23 | [23-ais_info.md](./23-ais_info.md) | `aisInfo` | Informações AIS e Agendamento | — ⚠️ Plataforma (não DS-160) | ✅ B/F/J/O |

---

## Convenções de Propriedades

### Identificação
| Propriedade | Descrição |
|---|---|
| `id` | Chave interna usada em `data` e `arrayData` |

### Mapeamento para Automação (consumido pelos Actors, não pelo form)
| Propriedade | Descrição |
|---|---|
| `ds160` | Seletor/ID do campo no portal CEAC |
| `ds160List` | ID da lista repetível no CEAC (para arrays) |
| `ds160p1/p2/p3` | Partes do campo SSN no CEAC |
| `ds160day/month/year` | Partes do campo date no CEAC |

O form ignora essas propriedades em runtime. Elas existem no schema para que os Actors de automação saibam como mapear o JSON gerado pelo form para os campos do portal CEAC.

### Tipos de Campo (`type`)
| Tipo | Descrição |
|---|---|
| `text` | Input de texto livre |
| `email` | Input de e-mail |
| `phone` | Input de telefone com seletor de país |
| `textarea` | Área de texto longo |
| `select` | Lista suspensa com opções fixas ou referenciadas |
| `radio` | Escolha binária (padrão: Sim/Não) ou múltipla opção |
| `date` | Data composta: dia (select) + mês (select) + ano (text) |
| `ssn` | Seguro social americano: 3 inputs separados (XXX-XX-XXXX) |
| `file` | Upload de arquivo/imagem |
| `array` | Grupo de campos repetíveis ("Adicionar outro") |
| `heading` | Título visual de sub-seção — sem input |
| `alert` | Bloco de aviso visual — sem input |
| `orientation` | Texto instrucional — sem input |

### Armazenamento Interno dos Tipos Compostos
| Tipo | Estrutura em `data` |
|---|---|
| `date` | `{ day, month, year }` — ex: `{ day: 5, month: "MAR", year: "1990" }` |
| `ssn` | `{ p1, p2, p3 }` — ex: `{ p1: "123", p2: "45", p3: "6789" }` |
| `array` | Armazenado em `arrayData[secId.fieldId]` como `[{...}, {...}]` |

### Modificadores de Comportamento
| Propriedade | Descrição |
|---|---|
| `required` | Campo obrigatório para validação e cálculo de progresso |
| `maxLen` | Limite máximo de caracteres |
| `noSpecial` | Bloqueia caracteres especiais na digitação |
| `uppercase` | Força maiúsculas automaticamente |
| `notFuture` | Válido apenas para `date`: não permite datas futuras |
| `allowNA` | Exibe checkbox "Não se Aplica" — armazena `"DNA"` no campo |
| `allowUnknown` | Exibe checkbox "Não Sei" — armazena `"UNKNOWN"` no campo |
| `default` | Valor padrão aplicado apenas se o campo estiver vazio |

### Modificadores de Layout (não afetam dados)
| Propriedade | Descrição |
|---|---|
| `inline` | Campo renderizado na mesma linha que o próximo campo `inline` |
| `flexBasis` | Largura base do campo quando `inline: true` |
| `fullWidth` | Campo ocupa largura total (dentro de arrays) |
| `spaceBefore` | Adiciona espaço acima do campo (em px) |
| `groupLabel` | Rótulo exibido acima de um bloco de campos condicionais agrupados |
| `hint` | Texto orientacional abaixo do label |
| `text` | Corpo de texto para campos `orientation` |
| `alertStyle` | Estilo visual do alerta: `warning`, `danger`, `info` |

### Modificadores de Opções
| Propriedade | Descrição |
|---|---|
| `options` | Lista de opções inline: `[{ value, label }]` |
| `optionsRef` | Referência a lista compartilhada: `countries`, `usStates`, `relationships`, etc. |
| `optionHints` | Dicas por opção: `{ "M": "texto explicativo" }` |
| `filteredBy` | Filtra opções pelo valor atual de outro campo: `{ field: "campoId" }`. Requer `group` em cada opção. |
| `excludeField` | Select exclui automaticamente o valor do campo referenciado (evita duplicação) |

### Modificadores de Condicional
| Propriedade | Descrição |
|---|---|
| `showWhen` | Visibilidade condicional: `{ field, equals }` ou `{ field, in: [] }` ou `{ field, notIn: [] }` |
| `showWhen.section` | Referência cross-seção: `{ section: "secId", field: "fieldId", equals: "val" }` |
| `hideWhenAllUnknown` | Array de `id`s: oculta este campo quando todos os referenciados estão marcados como UNKNOWN |
| `conditional: true` | Em seções: a seção inteira é condicional (usa `showWhen` no nível da seção) |

### Modificadores de Array
| Propriedade | Descrição |
|---|---|
| `maxItems` | Número máximo de entradas (padrão: 5) |
| `minEntries` | Número mínimo de entradas obrigatórias |
| `maxEntries` | Alias de `maxItems` em alguns arrays |
| `fields` | Lista de sub-campos do array |
| `noneOnlyFirstEntry` | Array com opção "NENHUMA": selecionar NONE na entrada 0 bloqueia adicionar mais |
| `noneValue` | Valor que representa "nenhum" (ex: `"NONE"`) |
| `noneField` | Campo do array que contém o valor NONE (ex: `"platform"`) |

### Modificadores de Phone
| Propriedade | Descrição |
|---|---|
| `phoneCountry` | País inicial do seletor (ex: `"us"`, `"br"`) |
| `phoneLocked` | Impede troca de país no seletor |

---

## Nomenclatura de Chaves

| Tipo de Campo | Padrão de Chave |
|---|---|
| Campo regular | `secId.fieldId` — ex: `personal1.surname` |
| Sub-campo de array | `secId.arrayId[idx].subFieldId` — ex: `travel.specificLocations[0].location` |
| Partes de SSN | `secId.ssn_p1`, `secId.ssn_p2`, `secId.ssn_p3` |
| Partes de Date | `secId.fieldId.day`, `secId.fieldId.month`, `secId.fieldId.year` |

---

## Referências de Opções Globais (`schema.options`)

| optionsRef | Uso |
|---|---|
| `countries` | Lista completa de países/regiões reconhecidos pelo CEAC (~200 entradas). Default BR = `BRZL`. |
| `usStates` | 50 estados americanos + DC + territórios |
| `relationships` | Parentesco para acompanhantes: Pai/Mãe, Cônjuge, Filho(a), Outro Parente, Amigo(a), Parceiro de Negócios, Outro |
| `usContactRelationships` | Relação com contato nos EUA: Parente, Cônjuge, Amigo/a, Sócio/a, Empregador, Oficial de Escola, Outro |
| `relativeTypes` | Tipo de parentesco nos EUA: Cônjuge, Noivo(a), Filho(a), Irmão/Irmã |
| `usStatus` | Status migratório nos EUA: Cidadão americano, Residente permanente (LPR), Não-imigrante, Outro/Não sei |
| `occupations` | Ocupações profissionais: Agricultura, Artista, Negócios, Computação, Educação, Engenharia, Governo, Do Lar, Jurídico, Médico, Militar, Ciências, Desempregado, Aposentado, Estudante, Outro |

---

## Estrutura `_meta` no JSON de Saída

```json
"_meta": {
  "visitedSections": ["personal1", "travel", "security"],
  "naFields": ["personal2.ssn", "personal1.fullNameNative"],
  "unknownFields": ["family1.fatherDob"]
}
```

- `visitedSections`: seções que o usuário acessou (critério 1 de conclusão)
- `naFields`: campos marcados como "Não se Aplica" — valor `"DNA"` no dado
- `unknownFields`: campos marcados como "Não Sei" — valor `"UNKNOWN"` no dado

---

## Manutenção

Sempre que o portal CEAC alterar um seletor DOM, atualizar o campo `ds160` correspondente no arquivo de seção. A fonte canônica é `ds160-schema.js` — estes documentos são derivados dela para consulta humana.
