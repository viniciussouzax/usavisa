# Seção 13: `prevSpouse` — Ex-Cônjuge

**Condicional de Seção:** `personal1.maritalStatus = D`

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `numberOfPrevious` | Número de ex-cônjuges | `text` | ✅ | `tbxNumberOfPrevSpouses` | maxLen:2. |
| `spouses` | Ex-cônjuges | `array` | — | `DListSpouse` | maxItems:5. |
| └ `surname` | Sobrenome | `text` | ✅ | `tbxSURNAME` | maxLen:33, noSpecial, uppercase. |
| └ `givenName` | Nome | `text` | ✅ | `tbxGIVEN_NAME` | maxLen:33, noSpecial, uppercase. |
| └ `dob` | Data de Nascimento | `date` | ✅ | `ddlDOBDay/Month / tbxDOBYear` | — |
| └ `nationality` | Nacionalidade | `select` | ✅ | `ddlSpouseNatDropDownList` | optionsRef:countries. |
| └ `pobCity` | Cidade de Nascimento | `text` | ✅ | `tbxSpousePOBCity` | maxLen:20, allowUnknown. |
| └ `pobCountry` | País de Nascimento | `select` | ✅ | `ddlSpousePOBCountry` | optionsRef:countries. |
| └ `dateOfMarriage` | Data do Casamento | `date` | ✅ | `ddlDomDay/Month / txtDomYear` | — |
| └ `dateMarriageEnded` | Data do Término | `date` | ✅ | `ddlDomEndDay/Month / txtDomEndYear` | — |
| └ `howEnded` | Como terminou | `textarea` | ✅ | `tbxHowMarriageEnded` | maxLen:4000. |
| └ `countryTerminated` | País onde foi dissolvido | `select` | ✅ | `ddlMarriageEnded_CNTRY` | optionsRef:countries. |
