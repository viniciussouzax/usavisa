# Seção 20: `temporaryWork` — Informações de Trabalho Temporário

**Condicional de Seção:** `travel.purposeCategory in [H, L, O, P, Q, R]`

> Visível apenas para vistos de trabalho temporário. Para requerentes H, L, O, P, Q e R esta é a última seção de coleta antes da Revisão Final. Para lógica de roteamento detalhada, consultar [`actors/ceac_ds160/navigation_rules.md`](../../../../actors/ceac_ds160/navigation_rules.md).

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `petitionNumber` | Número do Recibo/Petição | `text` | ✅ | `tbxPetitionNumber` | maxLen:13, uppercase. Hint: ex ABC1234567890. |
| `nameOfPetitioner` | Nome da Pessoa/Empresa da Petição | `text` | ✅ | `tbxNameOfPetitioner` | maxLen:66, uppercase. |
| `employerName` | Nome do Empregador | `text` | ✅ | `tbxEmployerName` | maxLen:75, uppercase. |
| `employerAddress` | Endereço nos EUA (Linha 1) | `text` | ✅ | `tbxEmpStreetAddress1` | maxLen:40, uppercase. |
| `employerAddress2` | Endereço nos EUA (Linha 2) | `text` | — | `tbxEmpStreetAddress2` | maxLen:40, uppercase. |
| `employerCity` | Cidade | `text` | ✅ | `tbxEmpCity` | maxLen:20, uppercase. |
| `employerState` | Estado | `select` | ✅ | `ddlEmpState` | optionsRef:usStates. |
| `employerZip` | CEP (ZIP Code) | `text` | — | `tbxZIPCode` | maxLen:10. |
| `employerPhone` | Telefone | `text` | ✅ | `tbxTEMP_WORK_TEL` | maxLen:15. |
| `monthlySalary` | Renda Mensal (USD) | `text` | ✅ | `tbxEmpSalaryInUSD` | maxLen:11. Nota: obrigatoriedade pode variar por subclasse de visto (ex: O1). |
