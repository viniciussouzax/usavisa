# Seção 16: `workEducation3` — Trabalho/Educação - Adicional

**Oculto automaticamente** se `personal1.dob` indicar solicitante com menos de 14 anos.

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `clanTribe` | Pertence a clã/tribo? | `radio` | ✅ | `rblCLAN_TRIBE_IND` | — |
| `clanTribeName` | Nome do clã/tribo | `text` | ✅ | `tbxCLAN_TRIBE_NAME` | `showWhen: clanTribe=Y`. maxLen:80. |
| `languages` | Idiomas que fala | `array` | — | `dtlLANGUAGES` | Sem conditional. maxItems:5. |
| └ `name` | Idioma | `text` | ✅ | `tbxLANGUAGE_NAME` | maxLen:66. fullWidth. |
| `countriesVisited` | Visitou outros países nos últimos 5 anos? | `radio` | ✅ | `rblCOUNTRIES_VISITED_IND` | Hint: informe todos os países/regiões visitados nos últimos 5 anos, exceto os EUA (informados na seção anterior). |
| `countriesVisitedList` | Países visitados | `array` | — | `dtlCountriesVisited` | `showWhen: countriesVisited=Y`. maxItems:10. |
| └ `country` | País/Região | `select` | ✅ | `ddlCOUNTRIES_VISITED` | optionsRef:countries. fullWidth. |
| `organizationMember` | Pertenceu a organizações? | `radio` | ✅ | `rblORGANIZATION_IND` | — |
| `organizations` | Organizações | `array` | — | `dtlORGANIZATIONS` | `showWhen: organizationMember=Y`. maxItems:5. |
| └ `name` | Nome da organização | `text` | ✅ | `tbxORGANIZATION_NAME` | maxLen:66. fullWidth. |
| `specializedSkills` | Possui habilidades especializadas? | `radio` | ✅ | `rblSPECIALIZED_SKILLS_IND` | Hint: armas, explosivos, nuclear/bio/química. |
| `specializedSkillsExplanation` | Descreva | `textarea` | ✅ | `tbxSPECIALIZED_SKILLS_EXPL` | `showWhen: specializedSkills=Y`. maxLen:4000. |
| `militaryService` | Já serviu nas forças armadas? | `radio` | ✅ | `rblMILITARY_SERVICE_IND` | — |
| `military` | Serviço militar | `array` | — | `dtlMILITARY_SERVICE` | `showWhen: militaryService=Y`. maxItems:5. |
| └ `country` | País/Região | `select` | ✅ | `ddlMILITARY_SVC_CNTRY` | optionsRef:countries. fullWidth. |
| └ `branch` | Ramo das Forças Armadas | `text` | ✅ | `tbxMILITARY_SVC_BRANCH` | maxLen:40. fullWidth. |
| └ `rank` | Patente/Posto | `text` | ✅ | `tbxMILITARY_SVC_RANK` | maxLen:40. fullWidth. |
| └ `specialty` | Especialidade Militar | `text` | ✅ | `tbxMILITARY_SVC_SPECIALTY` | maxLen:40. fullWidth. |
| └ `startDate` | Data início | `date` | ✅ | `ddlMILITARY_SVC_FROM... / tbxYear` | fullWidth. |
| └ `endDate` | Data término | `date` | ✅ | `ddlMILITARY_SVC_TO... / tbxYear` | fullWidth. |
| `insurgentOrg` | Membro de organização insurgente? | `radio` | ✅ | `rblINSURGENT_ORG_IND` | — |
| `insurgentOrgExplanation` | Explique | `textarea` | ✅ | `tbxINSURGENT_ORG_EXPL` | `showWhen: insurgentOrg=Y`. maxLen:4000. |
