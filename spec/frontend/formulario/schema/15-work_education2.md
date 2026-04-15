# Seção 15: `workEducation2` — Trabalho/Educação - Anterior

**Oculto automaticamente** se `personal1.dob` indicar solicitante com menos de 14 anos.

## Empregos Anteriores

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `hasPreviousEmployment` | Já trabalhou anteriormente? | `radio` | ✅ | `rblPreviouslyEmployed` | — |
| `previousEmployment` | Empregos anteriores | `array` | — | `dtlPrevEmpl` | `showWhen: hasPreviousEmployment=Y`. maxItems:5. |
| └ `name` | Empregador | `text` | ✅ | `tbEmployerName` | maxLen:75. fullWidth. |
| └ `prevEmplCountry` | País/Região | `select` | ✅ | `DropDownList2` | optionsRef:countries. fullWidth. |
| └ `prevEmplPostalCode` | CEP/Código Postal | `text` | — | `tbxPREV_EMPL_ADDR_POSTAL_CD` | maxLen:10, allowNA. fullWidth. |
| └ `prevEmplStreet1` | Endereço - Linha 1 | `text` | ✅ | `tbEmployerStreetAddress1` | maxLen:40. fullWidth. |
| └ `prevEmplStreet2` | Endereço - Linha 2 | `text` | — | `tbEmployerStreetAddress2` | maxLen:40. fullWidth. |
| └ `prevEmplCity` | Cidade | `text` | ✅ | `tbEmployerCity` | maxLen:20. fullWidth. |
| └ `prevEmplState` | Estado/Província | `text` | — | `tbxPREV_EMPL_ADDR_STATE` | maxLen:20, allowNA. fullWidth. |
| └ `prevEmplPhone` | Telefone | `phone` | — | `tbEmployerPhone` | fullWidth. |
| └ `jobTitle` | Cargo | `text` | — | `tbJobTitle` | maxLen:75. fullWidth. |
| └ `supervisor` | Supervisor (sobrenome) | `text` | — | `tbSupervisorSurname` | maxLen:33, allowNA. fullWidth. |
| └ `supervisorGivenName` | Supervisor (nome) | `text` | — | `tbSupervisorGivenName` | maxLen:33, allowNA. fullWidth. |
| └ `startDate` | Data início | `date` | ✅ | `ddlEmpDateFrom... / tbxEmpDateFromYear` | fullWidth. |
| └ `endDate` | Data término | `date` | ✅ | `ddlEmpDateTo... / tbxEmpDateToYear` | fullWidth. |
| └ `duties` | Funções | `textarea` | — | `tbDescribeDuties` | maxLen:4000. fullWidth. |

## Educação

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `hasEducation` | Possui educação adicional? | `radio` | ✅ | `rblOtherEduc` | — |
| `education` | Instituições de ensino | `array` | — | `dtlPrevEduc` | `showWhen: hasEducation=Y`. maxItems:5. |
| └ `name` | Instituição | `text` | ✅ | `tbxSchoolName` | maxLen:75. fullWidth. |
| └ `schoolCountry` | País/Região | `select` | ✅ | `ddlSchoolCountry` | optionsRef:countries. fullWidth. |
| └ `schoolPostalCode` | CEP/Código Postal | `text` | — | `tbxEDUC_INST_POSTAL_CD` | maxLen:10, allowNA. fullWidth. |
| └ `schoolStreet1` | Endereço - Linha 1 | `text` | ✅ | `tbxSchoolAddr1` | maxLen:40. fullWidth. |
| └ `schoolStreet2` | Endereço - Linha 2 | `text` | — | `tbxSchoolAddr2` | maxLen:40. fullWidth. |
| └ `schoolCity` | Cidade | `text` | ✅ | `tbxSchoolCity` | maxLen:20. fullWidth. |
| └ `schoolState` | Estado/Província | `text` | — | `tbxEDUC_INST_ADDR_STATE` | maxLen:20, allowNA. fullWidth. |
| └ `course` | Curso | `text` | ✅ | `tbxSchoolCourseOfStudy` | maxLen:66. fullWidth. |
| └ `startDate` | Data início | `date` | ✅ | `ddlSchoolFrom... / tbxSchoolFromYear` | fullWidth. |
| └ `endDate` | Data término | `date` | ✅ | `ddlSchoolTo... / tbxSchoolToYear` | fullWidth. |
