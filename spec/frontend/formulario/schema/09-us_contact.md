# Seção 9: `usContact` — Contato nos EUA

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `_contactIntro` | Instrução sobre contato nos EUA | `orientation` | — | — | Texto: informe uma pessoa que conheça o solicitante nos EUA, ou o nome de uma empresa/loja a visitar. Se não souber, informe a embaixada ou consulado dos EUA no país de origem. |
| `contactType` | Tipo de Contato | `radio` | ✅ | — | Opções: P(Pessoa), O(Organização). |
| `surname` | Sobrenome do Contato | `text` | ✅ | `tbxUS_POC_SURNAME` | `showWhen: contactType=P`. maxLen:33, noSpecial, uppercase. |
| `givenName` | Nome do Contato | `text` | ✅ | `tbxUS_POC_GIVEN_NAME` | `showWhen: contactType=P`. maxLen:33, noSpecial, uppercase. |
| `organization` | Nome da Organização | `text` | ✅ | `tbxUS_POC_ORGANIZATION` | `showWhen: contactType=O`. maxLen:33. |
| `relationship` | Relação com Você | `select` | ✅ | `ddlUS_POC_REL_TO_APP` | optionsRef:usContactRelationships. |
| `usContactStreet1` | Endereço nos EUA (Linha 1) | `text` | ✅ | `tbxUS_POC_ADDR_LN1` | maxLen:40. |
| `usContactStreet2` | Endereço nos EUA (Linha 2) | `text` | — | `tbxUS_POC_ADDR_LN2` | maxLen:40. Opcional. |
| `usContactCity` | Cidade | `text` | ✅ | `tbxUS_POC_ADDR_CITY` | maxLen:20. |
| `usContactState` | Estado | `select` | ✅ | `ddlUS_POC_ADDR_STATE` | optionsRef:usStates. |
| `usContactZip` | CEP (ZIP Code) | `text` | ✅ | `tbxUS_POC_ADDR_POSTAL_CD` | maxLen:10. |
| `usContactPhone` | Telefone | `phone` | ✅ | `tbxUS_POC_HOME_TEL` | phoneCountry:"us", phoneLocked:true. |
| `usContactEmail` | Email | `email` | ✅ | `tbxUS_POC_EMAIL_ADDR` | maxLen:50, allowNA. |
