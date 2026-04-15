# Seção 2: `personal1` — Informações Pessoais 1

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `givenName` | Nome | `text` | ✅ | `tbxAPP_GIVEN_NAME` | maxLen:33, noSpecial, uppercase. Hint: "FNU" se passaporte não tiver nome. |
| `surname` | Sobrenome | `text` | ✅ | `tbxAPP_SURNAME` | maxLen:33, noSpecial, uppercase. Hint: todos os sobrenomes do passaporte. |
| `fullNameNative` | Nome no alfabeto nativo | `text` | ✅ | `tbxAPP_FULL_NAME_NATIVE` | maxLen:100, allowNA. Hint: alfabeto do país de origem. |
| `otherNamesUsed` | Já usou outros nomes? | `radio` | ✅ | `rblOtherNames` | Hint: inclui nome de solteiro(a), nome religioso, profissional, apelido ou qualquer outro nome pelo qual você é ou foi conhecido(a). |
| `otherNames` | Outros nomes | `array` | — | `DListAlias` | `showWhen: otherNamesUsed=Y`. maxItems:5. |
| └ `givenName` | Nome | `text` | ✅ | `tbxGIVEN_NAME` | maxLen:33, noSpecial, uppercase |
| └ `surname` | Sobrenome | `text` | ✅ | `tbxSURNAME` | maxLen:33, noSpecial, uppercase |
| `telecode` | Possui telecode? | `radio` | ✅ | `rblTelecodeQuestion` | Hint: códigos de 4 dígitos para alfabetos não-romanos. |
| `telecodeGivenName` | Telecode do Nome | `text` | ✅ | `tbxAPP_TelecodeGIVEN_NAME` | `showWhen: telecode=Y`. maxLen:20. groupLabel: "Resposta". |
| `telecodeSurname` | Telecode do Sobrenome | `text` | ✅ | `tbxAPP_TelecodeSURNAME` | `showWhen: telecode=Y`. maxLen:20. |
| `sex` | Sexo | `select` | ✅ | `ddlAPP_GENDER` | Opções: M (Masculino), F (Feminino). |
| `maritalStatus` | Estado Civil | `select` | ✅ | `ddlAPP_MARITAL_STATUS` | Opções: M, C, P, S, W, D, L, O. optionHints por opção. **Controla seções 11, 12, 13.** |
| `otherMaritalStatusText` | Especifique estado civil | `textarea` | ✅ | `tbxOtherMaritalStatus` | `showWhen: maritalStatus=O`. maxLen:200. |
| `dob` | Data de Nascimento | `date` | ✅ | `ddlDOBDay/Month / tbxDOBYear` | notFuture. Hint: DD-MMM-AAAA. **Controla ocultação de workEducation1/2/3 se < 14 anos.** |
| `cityOfBirth` | Cidade de Nascimento | `text` | ✅ | `tbxAPP_POB_CITY` | maxLen:20, noSpecial. |
| `stateOfBirth` | Estado/Província de Nascimento | `text` | ✅ | `tbxAPP_POB_ST_PROVINCE` | maxLen:20, noSpecial, allowNA. |
| `countryOfBirth` | País de Nascimento | `select` | ✅ | `ddlAPP_POB_CNTRY` | optionsRef:countries. default:BRZL. Hint: selecione o nome atualmente reconhecido para o local onde você nasceu (fronteiras políticas mudam — use o nome atual). |

**Opções `maritalStatus`:** M=Casado(a), C=União Estável, P=União Civil, S=Solteiro(a), W=Viúvo(a), D=Divorciado(a), L=Separado(a) Legalmente, O=Outro.
