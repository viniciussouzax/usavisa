# Seção 14: `workEducation1` — Trabalho/Educação - Atual

**Oculto automaticamente** se `personal1.dob` indicar solicitante com menos de 14 anos.

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `occupation` | Ocupação/Profissão | `select` | ✅ | `ddlPresentOccupation` | optionsRef:occupations. Forneça informações sobre seu emprego ou educação atual. RT=Aposentado, H=Do Lar, N=Desempregado dispensam bloco de endereço/empregador. |
| `otherOccupation` | Especifique ocupação | `textarea` | ✅ | `tbxOtherOccupation` | `showWhen: occupation=O`. maxLen:40. |
| `employerName` | Nome do Empregador/Escola | `text` | ✅ | `tbxEmpSchName` | `showWhen: occupation notIn [RT, H, N]`. maxLen:75. |
| `employerCountry` | País/Região | `select` | ✅ | `ddlEmpSchCountry` | `showWhen: occupation notIn [RT, H, N]`. optionsRef:countries. |
| `employerPostalCode` | CEP/Código Postal | `text` | ✅ | `tbxWORK_EDUC_ADDR_POSTAL_CD` | `showWhen: occupation notIn [RT, H, N]`. maxLen:10, allowNA. |
| `employerStreet1` | Endereço - Linha 1 | `text` | ✅ | `tbxEmpSchAddr1` | `showWhen: occupation notIn [RT, H, N]`. maxLen:40. |
| `employerStreet2` | Endereço - Linha 2 | `text` | ✅ | `tbxEmpSchAddr2` | `showWhen: occupation notIn [RT, H, N]`. maxLen:40. |
| `employerCity` | Cidade | `text` | ✅ | `tbxEmpSchCity` | `showWhen: occupation notIn [RT, H, N]`. maxLen:20. |
| `employerState` | Estado/Província | `text` | ✅ | `tbxWORK_EDUC_ADDR_STATE` | `showWhen: occupation notIn [RT, H, N]`. maxLen:20, allowNA. |
| `employerPhone` | Telefone | `phone` | ✅ | `tbxWORK_EDUC_TEL` | `showWhen: occupation notIn [RT, H, N]`. |
| `employerStartDate` | Data de início | `date` | ✅ | `ddlEmpDateFrom... / tbxEmpDateFromYear` | `showWhen: occupation notIn [RT, H, N]`. |
| `monthlySalary` | Salário mensal em R$ | `text` | ✅ | `tbxCURR_MONTHLY_SALARY` | `showWhen: occupation notIn [RT, H, N]`. maxLen:15. |
| `duties` | Descrição das funções | `textarea` | ✅ | `tbxDescribeDuties` | `showWhen: occupation notIn [RT, H, N]`. maxLen:4000. Hint: forneça detalhes completos e honestos. Respostas vagas podem causar atrasos ou negativas na entrevista. |
