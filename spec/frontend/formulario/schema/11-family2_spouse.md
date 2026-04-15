# Seção 11: `family2` — Família - Cônjuge/Parceiro(a)

**Condicional de Seção:** `personal1.maritalStatus in [M, C, L, U]`

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `spouseSurname` | Sobrenome do Cônjuge | `text` | ✅ | `tbxSpouseSurname` | maxLen:33, noSpecial, uppercase. |
| `spouseGivenName` | Nome do Cônjuge | `text` | ✅ | `tbxSpouseGivenName` | maxLen:33, noSpecial, uppercase. |
| `spouseDob` | Data de Nascimento | `date` | ✅ | `ddlDOBDay/Month / tbxDOBYear` | — |
| `spouseNationality` | Nacionalidade | `select` | ✅ | `ddlSpouseNatDropDownList` | optionsRef:countries. |
| `spouseCityOfBirth` | Cidade de Nascimento | `text` | ✅ | `tbxSpousePOBCity` | maxLen:20, allowUnknown. |
| `spouseCountryOfBirth` | País de Nascimento | `select` | ✅ | `ddlSpousePOBCountry` | optionsRef:countries. |
| `spouseAddressType` | Endereço do Cônjuge | `select` | ✅ | `ddlSpouseAddressType` | Opções: H(Residencial), M(Correspondência), U(Contato EUA), D(Desconhecido), O(Outro — especificar). |
| `spouseCountry` | País | `select` | ✅ | `ddlSPOUSE_ADDR_CNTRY` | `showWhen: spouseAddressType=O`. optionsRef:countries. default:BRZL. |
| `spousePostalCode` | CEP/Código Postal | `text` | ✅ | `tbxSPOUSE_ADDR_POSTAL_CD` | `showWhen: spouseAddressType=O`. maxLen:10, allowNA. |
| `spouseStreet1` | Endereço - Linha 1 | `text` | ✅ | `tbxSPOUSE_ADDR_LN1` | `showWhen: spouseAddressType=O`. maxLen:40. Hint: sem caixa postal. |
| `spouseStreet2` | Endereço - Linha 2 | `text` | — | `tbxSPOUSE_ADDR_LN2` | `showWhen: spouseAddressType=O`. maxLen:40. |
| `spouseCity` | Cidade | `text` | ✅ | `tbxSPOUSE_ADDR_CITY` | `showWhen: spouseAddressType=O`. maxLen:20. |
| `spouseState` | Estado/Província | `text` | ✅ | `tbxSPOUSE_ADDR_STATE` | `showWhen: spouseAddressType=O`. maxLen:20, allowNA. |
