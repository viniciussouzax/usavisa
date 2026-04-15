# Seção 3: `personal2` — Informações Pessoais 2

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `nationality` | Nacionalidade | `select` | ✅ | `ddlAPP_NATL` | optionsRef:countries. |
| `otherNationality` | Possui outra nacionalidade? | `radio` | ✅ | `rblAPP_OTH_NATL_IND` | Hint: informe todas as nacionalidades que possui atualmente e todas que já possuiu anteriormente, independentemente de ter renunciado formalmente ou não. |
| `otherNationalities` | Outras nacionalidades | `array` | — | `dtlOTHER_NATL` | `showWhen: otherNationality=Y`. maxItems:5. |
| └ `country` | País | `select` | ✅ | `ddlOTHER_NATL` | optionsRef:countries. excludeField:nationality. fullWidth. |
| └ `hasPassport` | Possui passaporte desse país? | `radio` | ✅ | `rblOTHER_PPT_IND` | fullWidth. |
| └ `passportNumber` | Número do passaporte | `text` | ✅ | `tbxOTHER_PPT_NUM` | `showWhen: hasPassport=Y`. maxLen:20. |
| `permanentResident` | É residente permanente de outro país? | `radio` | ✅ | `rblPermResOtherCntryInd` | Hint: permissão sem limitação de tempo. |
| `permanentResidentCountries` | Países de residência permanente | `array` | — | `dtlOthPermResCntry` | `showWhen: permanentResident=Y`. maxItems:5. |
| └ `country` | País | `select` | ✅ | `ddlOthPermResCntry` | optionsRef:countries. excludeField:nationality. |
| `nationalId` | Identidade Nacional / CPF | `text` | ✅ | `tbxAPP_NATIONAL_ID` | maxLen:20, allowNA. Hint: número único de identificação fornecido pelo governo do país de nascimento (ex: CPF para brasileiros). Marque "Não se Aplica" se não possuir. |
| `ssn` | SSN dos EUA | `ssn` | ✅ | `tbxAPP_SSN1/2/3` | allowNA. Hint: apenas se já possuiu SSN. Formato: XXX-XX-XXXX. |
| `taxId` | Número de Contribuinte dos EUA | `text` | ✅ | `tbxAPP_TAX_ID` | maxLen:20, allowNA. Hint: ITIN/EIN. |
