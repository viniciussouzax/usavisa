# Seção 8: `passport` — Passaporte

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `type` | Tipo de Passaporte | `select` | ✅ | `ddlPPT_TYPE` | Opções: R(Regular), D(Diplomático), O(Oficial), L(Laissez-Passer), OT(Outro). |
| `typeExplanation` | Explique outro tipo | `textarea` | ✅ | `tbxPptOtherExpl` | `showWhen: type=OT`. maxLen:200. |
| `number` | Número do Passaporte | `text` | ✅ | `tbxPPT_NUM` | maxLen:20. Hint: exatamente como no passaporte. |
| `bookNumber` | Número do Livro | `text` | ✅ | `tbxPPT_BOOK_NUM` | maxLen:20, allowNA. Hint: contracapa; N/A se não houver. |
| `issuingCountry` | País/Autoridade Emissora | `select` | ✅ | `ddlPPT_ISSUED_CNTRY` | optionsRef:countries. |
| `issuedCity` | Cidade de Emissão | `text` | ✅ | `tbxPPT_ISSUED_IN_CITY` | maxLen:20, noSpecial. |
| `issuedState` | Estado/Província de Emissão | `text` | ✅ | `tbxPPT_ISSUED_IN_STATE` | maxLen:20, noSpecial. |
| `issuedCountry` | País/Região onde emitido | `select` | ✅ | `ddlPPT_ISSUED_IN_CNTRY` | optionsRef:countries. Hint: local físico (pode diferir do país emissor). |
| `issuanceDate` | Data de Emissão | `date` | ✅ | `ddlPPT_ISSUED_DTE... / tbxPPT_ISSUEDYear` | — |
| `expirationDate` | Data de Expiração | `date` | ✅ | `ddlPPT_EXPIRE_DTE... / tbxPPT_EXPIREYear` | allowNA. Hint: N/A se não tiver validade. |
| `lostOrStolen` | Perdeu/teve passaporte roubado? | `radio` | ✅ | `rblLOST_PPT_IND` | Hint: inclui todos os passaportes anteriores. |
| `lostPassports` | Passaportes perdidos/roubados | `array` | — | `dtlLostPPT` | `showWhen: lostOrStolen=Y`. maxItems:5. |
| └ `number` | Número | `text` | ✅ | `tbxLOST_PPT_NUM` | maxLen:20. |
| └ `country` | País | `select` | ✅ | `ddlLOST_PPT_NATL` | optionsRef:countries. |
| └ `explanation` | Explique | `textarea` | ✅ | `tbxLOST_PPT_EXPL` | maxLen:200. |
