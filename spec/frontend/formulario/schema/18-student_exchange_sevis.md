# Seção 18: `studentExchange` — Informações SEVIS

**Condicional de Seção:** `travel.purposeCategory in [F, J, M]`

> Seção visível apenas para vistos de estudante e intercâmbio. Para lógica de roteamento detalhada entre páginas do CEAC, consultar [`actors/ceac_ds160/navigation_rules.md`](../../../../actors/ceac_ds160/navigation_rules.md).

## Lógica Condicional Interna

```
purposeOfTrip
  ├── "F1-F1" / "J1-J1" / "M1"   → exibe bloco School Details (principal)
  ├── "J1-J1" / "J2-CH" / "J2-SP" → exibe campo Program Number
  └── "F2-CH" / "F2-SP" / "J2-CH" / "J2-SP" / "M2" → exibe campo Principal SEVIS ID (dependente)
```

## Campos

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `sevisId` | Número SEVIS | `text` | ✅ | `tbxSevisID` | maxLen:11, uppercase. Hint: ex N0123456789. Sempre visível quando a seção é exibida. |
| `programNumber` | Número do Programa | `text` | ✅ | `tbxProgram` | `showWhen: travel.purposeOfTrip in [J1-J1, J2-CH, J2-SP]`. maxLen:15, uppercase. |
| `principalSevisId` | SEVIS ID do Requerente Principal | `text` | ✅ | `tbxPrincipalSevisID` | `showWhen: travel.purposeOfTrip in [F2-CH, F2-SP, J2-CH, J2-SP, M2]`. maxLen:11, uppercase. Informado por dependentes (F2/J2/M2) com o SEVIS ID do titular. |
| `intendToStudy` | Pretende estudar nos EUA? | `radio` | ✅ | `rblStudyQuestion` | `showWhen: travel.purposeOfTrip in [J1-J1]`. |
| `schoolName` | Nome da Escola | `text` | ✅ | `tbxNameOfSchool` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:75, uppercase. |
| `courseOfStudy` | Curso de Estudo | `text` | ✅ | `tbxSchoolCourseOfStudy` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:66, uppercase. Hint: para high school usar "Academic" ou "Vocational". |
| `schoolAddress` | Endereço da Instituição (Linha 1) | `text` | ✅ | `tbxSchoolStreetAddress1` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:40, uppercase. |
| `schoolAddress2` | Endereço da Instituição (Linha 2) | `text` | — | `tbxSchoolStreetAddress2` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:40, uppercase. |
| `schoolCity` | Cidade da Instituição | `text` | ✅ | `tbxSchoolCity` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:20, uppercase. |
| `schoolState` | Estado | `select` | ✅ | `ddlSchoolState` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. optionsRef:usStates. |
| `schoolZip` | CEP (ZIP Code) | `text` | ✅ | `tbxSchoolZIPCode` | `showWhen: travel.purposeOfTrip in [F1-F1, J1-J1, M1]`. maxLen:10. |
