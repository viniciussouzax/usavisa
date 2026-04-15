# Seção 19: `studentAddContact` — Contatos Adicionais (Estudante)

**Condicional de Seção:** `travel.purposeOfTrip in [F1-F1, J1-J1, M1]`

> Visível apenas para requerentes **principais** de visto estudante/intercâmbio (não para dependentes F2/J2/M2). O CEAC exige **mínimo de 2 contatos** nesta seção — não são familiares imediatos ou parentes.

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `studentAddContactNote` | Alerta informativo | `alert` | — | — | alertStyle:info. |
| `contacts` | Contatos | `array` | ✅ | `dtlStudentAddPOC` | minEntries:2, maxEntries:5. Mínimo de 2 contatos obrigatórios. |
| └ `surname` | Sobrenome | `text` | ✅ | `tbxADD_POC_SURNAME` | maxLen:33, uppercase. |
| └ `givenName` | Nome | `text` | ✅ | `tbxADD_POC_GIVEN_NAME` | maxLen:33, uppercase. |
| └ `address1` | Endereço (Linha 1) | `text` | ✅ | `tbxADD_POC_ADDR_LN1` | maxLen:40, uppercase. |
| └ `address2` | Endereço (Linha 2 - Bairro) | `text` | — | `tbxADD_POC_ADDR_LN2` | maxLen:40, uppercase. |
| └ `city` | Cidade | `text` | ✅ | `tbxADD_POC_ADDR_CITY` | maxLen:20, uppercase. |
| └ `state` | Estado/Província | `text` | — | `tbxADD_POC_ADDR_STATE` | maxLen:20, uppercase, allowNA. |
| └ `postalCode` | CEP/Código Postal | `text` | — | `tbxADD_POC_ADDR_POSTAL_CD` | maxLen:10, allowNA. |
| └ `country` | País | `select` | ✅ | `ddlADD_POC_ADDR_CTRY` | optionsRef:countries. |
| └ `phone` | Telefone | `phone` | — | `tbxADD_POC_TEL` | allowNA. |
| └ `email` | E-mail | `email` | — | `tbxADD_POC_EMAIL_ADDR` | maxLen:50, allowNA. |
