# Seção 6: `previousUSTravel` — Viagens Anteriores aos EUA

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `hasBeenInUS` | Já esteve nos EUA? | `radio` | ✅ | `rblPREV_US_TRAVEL_IND` | Hint: informe se já visitou os Estados Unidos em qualquer momento, mesmo que brevemente. |
| `previousVisits` | Visitas anteriores | `array` | — | `dtlPREV_US_VISIT` | `showWhen: hasBeenInUS=Y`. maxItems:5. |
| └ `arrivalDate` | Data de chegada | `date` | ✅ | `ddlPREV_US_VISIT_DTE...` | fullWidth. |
| └ `lengthOfStay` | Tempo de permanência | `text` | ✅ | `tbxPREV_US_VISIT_LOS` | maxLen:3. flexBasis:100px. |
| └ `lengthOfStayUnit` | Período | `select` | ✅ | `ddlPREV_US_VISIT_LOS_CD` | Opções: Y, M, W, D, H. flexBasis:300px. |
| `hasDriversLicense` | Possui/possuiu CNH americana? | `radio` | ✅ | `rblPREV_US_DRIVER_LIC_IND` | `showWhen: hasBeenInUS=Y`. |
| `driversLicenses` | Carteiras de motorista | `array` | — | `dtlUS_DRIVER_LICENSE` | `showWhen: hasDriversLicense=Y`. maxItems:5. |
| └ `number` | Número da carteira | `text` | ✅ | `tbxUS_DRIVER_LICENSE` | maxLen:20, allowUnknown. |
| └ `state` | Estado emissor | `select` | ✅ | `ddlUS_DRIVER_LICENSE_STATE` | optionsRef:usStates. |
| `hasUSVisa` | Já recebeu visto americano? | `radio` | ✅ | `rblPREV_VISA_IND` | — |
| `previousVisaIssueDate` | Data de emissão do último visto | `date` | ✅ | `ddlPREV_VISA_ISSUED_DTE...` | `showWhen: hasUSVisa=Y`. |
| `previousVisaNumber` | Número do visto | `text` | ✅ | `tbxPREV_VISA_FOIL_NUMBER` | `showWhen: hasUSVisa=Y`. maxLen:12, allowUnknown. Hint: 8 dígitos em vermelho. |
| `sameVisaType` | Solicitando mesmo tipo de visto? | `radio` | ✅ | `rblPREV_VISA_SAME_TYPE_IND` | `showWhen: hasUSVisa=Y`. |
| `sameCountry` | Solicitando no mesmo país onde emitido? | `radio` | ✅ | `rblPREV_VISA_SAME_CNTRY_IND` | `showWhen: hasUSVisa=Y`. |
| `tenPrint` | Forneceu impressões dos 10 dedos? | `radio` | ✅ | `rblPREV_VISA_TEN_PRINT_IND` | `showWhen: hasUSVisa=Y`. Hint: todos os dedos das mãos. |
| `visaLost` | Visto foi perdido ou roubado? | `radio` | ✅ | `rblPREV_VISA_LOST_IND` | `showWhen: hasUSVisa=Y`. |
| `lostVisaYear` | Ano da perda/roubo | `text` | ✅ | `tbxPREV_VISA_LOST_YEAR` | `showWhen: visaLost=Y`. maxLen:4. |
| `lostVisaExplanation` | Explique | `textarea` | ✅ | `tbxPREV_VISA_LOST_EXPL` | `showWhen: visaLost=Y`. maxLen:4000. |
| `visaCancelled` | Visto cancelado ou revogado? | `radio` | ✅ | `rblPREV_VISA_CANCELLED_IND` | `showWhen: hasUSVisa=Y`. |
| `cancelledExplanation` | Explique | `textarea` | ✅ | `tbxPREV_VISA_CANCELLED_EXPL` | `showWhen: visaCancelled=Y`. maxLen:4000. |
| `visaRefused` | Visto negado ou entrada recusada? | `radio` | ✅ | `rblPREV_VISA_REFUSED_IND` | Hint: inclui recusa de visto, recusa de admissão nos EUA e retirada voluntária de solicitação no porto de entrada. |
| `visaRefusedExplanation` | Explique | `textarea` | ✅ | `tbxPREV_VISA_REFUSED_EXPL` | `showWhen: visaRefused=Y`. maxLen:4000. |
| `immigrantPetition` | Petição de imigrante apresentada ao USCIS? | `radio` | ✅ | `rblIV_PETITION_IND` | — |
| `immigrantPetitionExplanation` | Explique | `textarea` | ✅ | `tbxIV_PETITION_EXPL` | `showWhen: immigrantPetition=Y`. maxLen:4000. |
| `vwpDenial` | Entrada negada pelo Visa Waiver Program? | `radio` | ✅ | `rblVWP_DENIAL_IND` | Hint: apenas para países do VWP. |
| `vwpDenialExplanation` | Explique | `textarea` | ✅ | `tbxVWP_DENIAL_EXPL` | `showWhen: vwpDenial=Y`. maxLen:4000. |
