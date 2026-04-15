# Seção 7: `addressPhone` — Endereço e Telefone

## Sub-bloco: Endereço Residencial

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `homeCountry` | País/Região | `select` | ✅ | `ddlCountry` | optionsRef:countries. default:BRZL. |
| `homePostalCode` | CEP/Código Postal | `text` | ✅ | `tbxAPP_ADDR_POSTAL_CD` | maxLen:10, allowNA. Hint: auto-fill de endereço. |
| `homeStreet1` | Rua/Endereço (Linha 1) | `text` | ✅ | `tbxAPP_ADDR_LN1` | maxLen:40. |
| `homeStreet2` | Rua/Endereço (Linha 2) | `text` | ✅ | `tbxAPP_ADDR_LN2` | maxLen:40. |
| `homeCity` | Cidade | `text` | ✅ | `tbxAPP_ADDR_CITY` | maxLen:20, noSpecial. |
| `homeState` | Estado/Província | `text` | ✅ | `tbxAPP_ADDR_STATE` | maxLen:20, noSpecial, allowNA. |

## Sub-bloco: Endereço para Correspondência

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `mailingAddressSame` | Mesmo endereço residencial? | `radio` | ✅ | `rblMailingAddrSame` | — |
| `mailCountry` | País/Região | `select` | ✅ | `ddlMailCountry` | `showWhen: mailingAddressSame=N`. optionsRef:countries. |
| `mailPostalCode` | CEP/Código Postal | `text` | ✅ | `tbxMAILING_ADDR_POSTAL_CD` | `showWhen: mailingAddressSame=N`. maxLen:10, allowNA. |
| `mailStreet1` | Rua/Endereço (Linha 1) | `text` | ✅ | `tbxMAILING_ADDR_LN1` | `showWhen: mailingAddressSame=N`. maxLen:40. |
| `mailStreet2` | Rua/Endereço (Linha 2) | `text` | ✅ | `tbxMAILING_ADDR_LN2` | `showWhen: mailingAddressSame=N`. maxLen:40. |
| `mailCity` | Cidade | `text` | ✅ | `tbxMAILING_ADDR_CITY` | `showWhen: mailingAddressSame=N`. maxLen:20. |
| `mailState` | Estado/Província | `text` | ✅ | `tbxMAILING_ADDR_STATE` | `showWhen: mailingAddressSame=N`. maxLen:20, allowNA. |

## Sub-bloco: Telefone

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `phone` | Telefone Principal | `phone` | ✅ | `tbxAPP_HOME_TEL` | Hint: fixo ou celular de mais fácil acesso. |
| `mobilePhone` | Telefone Secundário | `phone` | — | `tbxAPP_MOBILE_TEL` | allowNA. |
| `businessPhone` | Telefone Comercial | `phone` | — | `tbxAPP_BUS_TEL` | allowNA. |
| `additionalPhones` | Usou outros números nos últimos 5 anos? | `radio` | ✅ | `rblAddPhone` | — |
| `additionalPhoneNumbers` | Telefone Adicional | `array` | — | `dtlAddPhone` | `showWhen: additionalPhones=Y`. maxItems:4. |
| └ `phone` | Número Adicional | `phone` | ✅ | `tbxAddPhoneInfo` | — |

## Sub-bloco: Email

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `email` | Email | `email` | ✅ | `tbxAPP_EMAIL_ADDR` | maxLen:50. Hint: email frequente e seguro. |
| `additionalEmails` | Usou outros emails nos últimos 5 anos? | `radio` | ✅ | `rblAddEmail` | — |
| `additionalEmailAddresses` | Email Adicional | `array` | — | `dtlAddEmail` | `showWhen: additionalEmails=Y`. maxItems:4. |
| └ `email` | Email Adicional | `email` | ✅ | `tbxAddEmailInfo` | maxLen:50. |

## Sub-bloco: Redes Sociais

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `_socialMediaIntro` | Instrução sobre redes sociais | `orientation` | — | — | Texto explicativo sobre seleção de plataformas. |
| `socialMedia` | Redes Sociais | `array` | — | `dtlSocial` | **noneOnlyFirstEntry:true**, noneValue:"NONE", noneField:"platform". maxItems:5. |
| └ `platform` | Plataforma | `select` | ✅ | `ddlSocialMedia` | default:"NONE". Opções: NONE(Nenhuma), ASKF, DUBN, FCBK, FLKR, GOGL, INST, LINK, MYSP, PTST, QZNE, RDDT, SWBO, TWBO, TUMB, TWIT, TWOO, VINE, VKON, YUKU, YTUB. |
| └ `handle` | Identificador | `text` | ✅ | `tbxSocialMediaIdent` | maxLen:50. |
| `additionalSocialMedia` | Outros sites/apps nos últimos 5 anos? | `radio` | ✅ | `rblAddSocial` | Hint: não inclui mensagens privadas (WhatsApp). |
| `additionalSocialMediaAccounts` | Outras Redes Sociais | `array` | — | `dtlAddSocial` | `showWhen: additionalSocialMedia=Y`. maxItems:4. |
| └ `platform` | Plataforma | `text` | ✅ | `tbxAddSocialPlat` | maxLen:40. |
| └ `handle` | Identificador | `text` | ✅ | `tbxAddSocialHand` | maxLen:40. |
