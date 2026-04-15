# Seção 17: `security` — Segurança e Antecedentes

Todas as perguntas são `radio`, `required:true`, `default:"N"`.
Campos com sufixo `_Expl` são `textarea` (maxLen:200) e aparecem `showWhen: [id]=Y`.

> **Orientação para campos de explicação:** Forneça detalhes completos e honestos. Respostas vagas ou incompletas podem causar atrasos no processamento ou negativa do visto. O oficial consular tem acesso ao histórico — omissões são detectadas.

| id | label | ds160 | tem Expl? |
|---|---|---|---|
| `disease` | Possui doença comunicável? | `rblDisease` | ✅ `tbxDisease_EXPL` |
| `disorder` | Possui distúrbio mental ou físico? | `rblDisorder` | ✅ `tbxDisorder_EXPL` |
| `drugUser` | É usuário de drogas? | `rblDruguser` | ✅ `tbxDruguser_EXPL` |
| `arrested` | Já foi preso ou condenado? | `rblArrested` | ✅ `tbxArrested_EXPL` |
| `controlledSubstances` | Violou lei de substâncias controladas? | `rblControlledSubstances` | ✅ `tbxControlledSubstances_EXPL` |
| `prostitution` | Envolvido em prostituição? | `rblProstitution` | — |
| `moneyLaundering` | Envolvido em lavagem de dinheiro? | `rblMoneyLaundering` | — |
| `humanTrafficking` | Envolvido em tráfico de pessoas? | `rblHumanTrafficking` | — |
| `assistedSevereTrafficking` | Auxiliou tráfico severo? | `rblAssistedSevereTrafficking` | — |
| `humanTraffickingRelated` | Parente de traficante de pessoas? | `rblHumanTraffickingRelated` | — |
| `illegalActivity` | Pretende atividades ilegais nos EUA? | `rblIllegalActivity` | — |
| `terroristActivity` | Envolvido em atividades terroristas? | `rblTerroristActivity` | — |
| `terroristSupport` | Apoiou atividades terroristas? | `rblTerroristSupport` | — |
| `terroristOrg` | Membro de organização terrorista? | `rblTerroristOrg` | — |
| `terroristRel` | Parente de envolvido em terrorismo? | `rblTerroristRel` | — |
| `genocide` | Envolvido em genocídio? | `rblGenocide` | — |
| `torture` | Envolvido em tortura? | `rblTorture` | — |
| `exViolence` | Envolvido em violência extrajudicial? | `rblExViolence` | — |
| `childSoldier` | Recrutou crianças-soldado? | `rblChildSoldier` | — |
| `religiousFreedom` | Violou liberdade religiosa? | `rblReligiousFreedom` | — |
| `populationControls` | Envolvido em controle populacional forçado? | `rblPopulationControls` | — |
| `transplant` | Envolvido em transplante forçado de órgãos? | `rblTransplant` | — |
| `removalHearing` | Já teve audiência de remoção? | `rblRemovalHearing` | — |
| `immigrationFraud` | Cometeu fraude imigratória? | `rblImmigrationFraud` | — |
| `failToAttend` | Falhou em comparecer a audiência? | `rblFailToAttend` | — |
| `visaViolation` | Violou termos do visto? | `rblVisaViolation` | — |
| `deport` | Já foi deportado? | `rblDeport` | — |
| `childCustody` | Detém custódia de criança de cidadão americano? | `rblChildCustody` | — |
| `votingViolation` | Violou lei eleitoral? | `rblVotingViolation` | — |
| `renounceExp` | Renunciou cidadania para evitar impostos? | `rblRenounceExp` | — |
| `attWoReimb` | Participou de treinamento sem reembolso? | `rblAttWoReimb` | — |
