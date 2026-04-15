# Seção 12: `deceasedSpouse` — Cônjuge Falecido

**Condicional de Seção:** `personal1.maritalStatus = W`

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `surname` | Sobrenome | `text` | ✅ | `tbxSURNAME` | maxLen:33, noSpecial, uppercase. |
| `givenName` | Nome | `text` | ✅ | `tbxGIVEN_NAME` | maxLen:33, noSpecial, uppercase. |
| `dob` | Data de Nascimento | `date` | ✅ | `ddlDOBDay/Month / tbxDOBYear` | — |
| `nationality` | Nacionalidade | `select` | ✅ | `ddlSpouseNatDropDownList` | optionsRef:countries. |
| `cityOfBirth` | Cidade de Nascimento | `text` | ✅ | `tbxSpousePOBCity` | maxLen:20, allowUnknown. |
| `countryOfBirth` | País de Nascimento | `select` | ✅ | `ddlSpousePOBCountry` | optionsRef:countries. |
