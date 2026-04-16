# Matriz de Bifurcações e DataLists do CEAC

> **Natureza deste documento:** Este documento é um fato arquitetural da estrutura do formulário DS-160 do CEAC. Ele cataloga de forma exaustiva todas as 19 listas dinâmicas (`AddAnother`) e todas as ~64 ramificações condicionais que alteram o DOM com base nas respostas do usuário.

Qualquer engine de automação deve ser capaz de navegar e preencher corretamente todas essas ramificações caso o payload aplicável venha configurado para ativá-las.

---

## 1. As 19 DataLists (AddAnother) do DS-160

O DS-160 possui exatas 19 instâncias de `DataList` (blocos "Add Another"). A engine precisa gerenciar a exclusão (`Prune-on-Hide` e rows remanescentes) e adição sequencial para estas estruturas.

| Stage / Grupo | ID da DataList Interna | Descrição Lógica |
|---|---|---|
| **Personal 1** | `DListAlias` | Outros Nomes Usados |
| **Personal 2** | `dtlOTHER_NATL` | Outras Nacionalidades |
| **Personal 2** | `dtlOthPermResCntry` | Outros Países de Residência Permanente |
| **Travel** | `dtlTravelLoc` | Planos Específicos de Viagem (Cidades) |
| **Companions** | `dlTravelCompanions` | Companheiros de Viagem |
| **Prev US Travel** | `dtlPREV_US_VISIT` | Visitas Anteriores aos EUA |
| **Prev US Travel** | `dtlUS_DRIVER_LICENSE` | Carteiras de Motorista dos EUA |
| **Address/Phone** | `dtlSocial` / `dtlAddSocial` | Mídias Sociais Adicionais |
| **Address/Phone** | `dtlAddPhone` | Telefones Adicionais |
| **Address/Phone** | `dtlAddEmail` | Emails Adicionais |
| **Passport** | `dtlLostPPT` | Passaportes Perdidos/Roubados |
| **Family** | `dlUSRelatives` | Parentes Imediatos nos EUA |
| **Family (Prev Spouse)** | `DListSpouse` / `dlPrevSpouse`| Cônjuges Anteriores (Em caso de Divórcio) |
| **Work/Education 2** | `dtlPrevEmpl` | Empregos Anteriores |
| **Work/Education 2** | `dtlPrevEduc` | Escolas/Formações Anteriores |
| **Work/Education 3** | `dtlLANGUAGES` | Idiomas Falados |
| **Work/Education 3** | `dtlCountriesVisited` | Países Visitados nos últimos 5 anos |
| **Work/Education 3** | `dtlORGANIZATIONS` | Organizações Que Participa |
| **Work/Education 3** | `dtlMILITARY_SERVICE` | Serviço Militar Anterior |

---

## 2. Matriz de Condicionais (Bifurcações de DOM)

Estas são as lógicas condicionais mapeadas que geram postbacks revelando novos campos textuais ou ativando as DataLists acima. O Payload Schema deve prever dados para satisfazer essas ramificações.

### 2.1 Personal & Identifiers
- `otherNamesUsed=Y` → Revela DListAlias
- `telecode=Y` → Revela campos de Telecode (Surname/GivenName)
- `otherNationality=Y` → Revela dtlOTHER_NATL
- `otherNationalityPassport=Y` → Revela campo Passport Number
- `permanentResident=Y` → Revela dtlOthPermResCntry
- **Sentinelas N/A (DNA)**: `ssn=DNA` (checkbox SSN_NA), `taxId=DNA` (checkbox TAX_ID_NA), `nationalId=DNA` (checkbox NATIONAL_ID_NA)

### 2.2 Travel & Companions
- `hasSpecificPlans=Y` → Revela dtlTravelLoc
- `whoIsPaying=OTH` → Revela Payer Name + Address
- `whoIsPaying=COM` → Revela Paying Company Name
- `payer.sameAddress=N` → Revela campos editáveis do Payer Address
- `travelingWithOthers=Y` → Revela dlTravelCompanions
- `partOfGroup=Y` → Revela GroupName

### 2.3 Previous US Travel
- `hasBeenInUS=Y` → Revela dtlPREV_US_VISIT e ativa pergunta de Carteira de Motorista
- `hasDriversLicense=Y` → Revela dtlUS_DRIVER_LICENSE
- `hasUSVisa=Y` → Revela campos de visto anterior (Número, data emissão, etc)
- `previousVisa.lost=Y` → Exige ano e explicação
- `previousVisa.cancelled=Y` → Exige explicação
- `visaRefused=Y` → Exige explicação (Refusal)
- `immigrantPetition=Y` → Exige explicação (Petição de imigrante)

### 2.4 Address, Phone & Passport
- `mailingAddressSame=N` → Revela Mailing Address fields
- `mobilePhone=DNA` / `businessPhone=DNA` / `bookNumber=DNA` → Preenche checkbox `NA`
- `additionalPhones=Y` → Revela dtlAddPhone
- `additionalEmails=Y` → Revela dtlAddEmail
- `additionalSocialMedia=Y` → Revela dtlAddSocial
- `lostOrStolen=Y` (Passport) → Revela dtlLostPPT

### 2.5 US Contact
- `nameDoNotKnow=true` → Preenche checkboxes NA e foca no Organization Name (Obrigatório Perna 2)
- `orgDoNotKnow=true` → Preenche checkbox NA e foca no Nome Completo (Obrigatório Perna 1)
- *(Regra: O CEAC obriga o preenchimento de ao menos um dos dois).*

### 2.6 Family (Parents, Relatives & Spouse)
- **Unknown Checkboxes**: Father Name UNK, Father DOB UNK, Mother Name UNK, Mother DOB UNK.
- `immediateRelativesInUS=Y` → Revela dlUSRelatives
- `maritalStatus=M/C/P/L` (Married/Common Law/Civil Union/etc) → Revela Spouse fields genéricos
- `maritalStatus=S/other` (Single, etc) → Spouse fields recebem NA checkboxes
- `spouse.addressType=O` (Other) → Revela campos textuais de Spouse Address
- `maritalStatus=D` (Divorced) → Aciona `DListSpouse` (Ex-Spouses)
- `maritalStatus=W` (Widowed) → Aciona Deceased Spouse fields genéricos e lida com NA checkbox para Deceased City of Birth.

### 2.7 Work & Education
- `occupation=N/O` (Not Employed / Other) → Revela ExplainOtherPresentOccupation textbox
- **Unknown Checkboxes**: Se supervisor for desconhecido (checkbox NA).
- `hasPreviousEmployment=Y` → Revela dtlPrevEmpl
- `hasEducation=Y` → Revela dtlPrevEduc
- (Exceção: dtlLANGUAGES não tem postback de radio antes, o botão AddAnother sempre vem renderizado por padrão se for solicitado).
- `countriesVisited=Y` → Revela dtlCountriesVisited
- `organizationMember=Y` → Revela dtlORGANIZATIONS
- `militaryService=Y` → Revela dtlMILITARY_SERVICE
- Lógicas booleanas que revelam textareas: `specializedSkills=Y`, `insurgentOrg=Y`, `clanTribe=Y`.

### 2.8 Security Questions (Parts 1-5)
Qualquer branch afirmativa de segurança (ex: `rblDisease...Y`, `rblArrested`, `rblDeport`) altera o radio button e força a renderização de um campo `textarea` para gerar uma "Explicação" da violação. A engine deve tratar essas aparições como mandatórias para prosseguir caso a trigger for ativada pelo Payload.
