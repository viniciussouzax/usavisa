# Seção 10: `family1` — Família - Pais

## Sub-bloco: Pai

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `fatherSurname` | Sobrenome do Pai | `text` | ✅ | `tbxFATHER_SURNAME` | maxLen:33, noSpecial, uppercase, allowUnknown. |
| `fatherGivenName` | Nome do Pai | `text` | ✅ | `tbxFATHER_GIVEN_NAME` | maxLen:33, noSpecial, uppercase, allowUnknown. |
| `fatherDob` | Data de Nascimento do Pai | `date` | ✅ | `ddlFathersDOB... / tbxFathersDOBYear` | allowUnknown. `hideWhenAllUnknown: [fatherSurname, fatherGivenName]`. |
| `fatherInUS` | Pai está nos EUA? | `radio` | ✅ | `rblFATHER_LIVE_IN_US_IND` | `hideWhenAllUnknown: [fatherSurname, fatherGivenName]`. |
| `fatherUSStatus` | Status do pai nos EUA | `select` | ✅ | `ddlFATHER_US_STATUS` | `showWhen: fatherInUS=Y`. optionsRef:usStatus. |

## Sub-bloco: Mãe

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `motherSurname` | Sobrenome da Mãe | `text` | ✅ | `tbxMOTHER_SURNAME` | maxLen:33, noSpecial, uppercase, allowUnknown. |
| `motherGivenName` | Nome da Mãe | `text` | ✅ | `tbxMOTHER_GIVEN_NAME` | maxLen:33, noSpecial, uppercase, allowUnknown. |
| `motherDob` | Data de Nascimento da Mãe | `date` | ✅ | `ddlMothersDOB... / tbxMothersDOBYear` | allowUnknown. `hideWhenAllUnknown: [motherSurname, motherGivenName]`. |
| `motherInUS` | Mãe está nos EUA? | `radio` | ✅ | `rblMOTHER_LIVE_IN_US_IND` | `hideWhenAllUnknown: [motherSurname, motherGivenName]`. |
| `motherUSStatus` | Status da mãe nos EUA | `select` | ✅ | `ddlMOTHER_US_STATUS` | `showWhen: motherInUS=Y`. optionsRef:usStatus. |

## Sub-bloco: Parentes nos EUA

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `immediateRelativesInUS` | Tem parentes imediatos nos EUA? | `radio` | ✅ | `rblUS_IMMED_RELATIVE_IND` | spaceBefore:16. Hint: cônjuge, noivo(a), filho(a), irmão/irmã. Não inclui pais. |
| `otherRelativesInUS` | Tem outros parentes nos EUA? | `radio` | ✅ | `rblUS_OTHER_RELATIVE_IND` | `showWhen: immediateRelativesInUS=N`. spaceBefore:16. |
| `relatives` | Parentes nos EUA | `array` | — | `dlUSRelatives` | `showWhen: immediateRelativesInUS=Y`. maxItems:5. |
| └ `givenName` | Nome | `text` | ✅ | `tbxUS_REL_GIVEN_NAME` | maxLen:33, noSpecial, uppercase. |
| └ `surname` | Sobrenome | `text` | ✅ | `tbxUS_REL_SURNAME` | maxLen:33, noSpecial, uppercase. |
| └ `type` | Parentesco | `select` | ✅ | `ddlUS_REL_TYPE` | optionsRef:relativeTypes. |
| └ `status` | Status migratório | `select` | ✅ | `ddlUS_REL_STATUS` | optionsRef:usStatus. |
| `otherRelatives` | Outros parentes nos EUA | `array` | — | `dlUSRelatives` | `showWhen: otherRelativesInUS=Y`. maxItems:5. Sub-campos idênticos a `relatives`. |
