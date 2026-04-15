# Seção 4: `travel` — Viagem

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `purposeCategory` | Categoria do Visto | `select` | ✅ | `ddlPurposeOfTrip` | Opções: B, F, J, O. **Controla seções 18 e 20.** Usado como filtro para `purposeOfTrip`. |
| `purposeOfTrip` | Tipo de Visto Específico | `select` | ✅ | `ddlOtherPurpose` | `filteredBy: purposeCategory`. Grupos: B, F, J, H, C, CW, D, E, I, K, L, M, O, P, Q, R, T, TD, TN, U, OTHER. **Controla seção 19.** |
| `hasSpecificPlans` | Possui planos específicos? | `radio` | ✅ | `rblSpecificTravel` | Hint: datas/voos/locais definidos → Sim; estimativa → Não. |
| `arrivalDate` | Data de Chegada | `date` | ✅ | `ddlARRIVAL_US_DTEDay/Month / tbxYear` | `showWhen: hasSpecificPlans=Y`. fullWidth. |
| `arrivalFlight` | Voo de Chegada | `text` | ✅ | `tbxArriveFlight` | `showWhen: hasSpecificPlans=Y`. maxLen:20. |
| `arrivalCity` | Cidade de Chegada | `text` | ✅ | `tbxArriveCity` | `showWhen: hasSpecificPlans=Y`. maxLen:20. |
| `departureDate` | Data de Partida | `date` | ✅ | `ddlDEPARTURE_US_DTEDay/Month / tbxYear` | `showWhen: hasSpecificPlans=Y`. |
| `departureFlight` | Voo de Partida | `text` | ✅ | `tbxDepartFlight` | `showWhen: hasSpecificPlans=Y`. maxLen:20. |
| `departureCity` | Cidade de Partida | `text` | ✅ | `tbxDepartCity` | `showWhen: hasSpecificPlans=Y`. maxLen:20. |
| `specificLocations` | Locais nos EUA | `array` | — | `dtlTravelLoc` | `showWhen: hasSpecificPlans=Y`. maxItems:5. |
| └ `location` | Local | `text` | ✅ | `tbxSPECTRAVEL_LOCATION` | maxLen:40. |
| `nonSpecificArrival` | Data prevista de chegada | `date` | ✅ | `ddlARRIVAL_US_NSDTEDay/Month / tbxYear` | `showWhen: hasSpecificPlans=N`. |
| `lengthOfStay` | Tempo de permanência | `text` | ✅ | `tbxAPP_LOS` | `showWhen: hasSpecificPlans=N`. maxLen:3. inline, flexBasis:100px. |
| `lengthOfStayUnit` | Unidade | `select` | ✅ | `ddlAPP_LOS_CD` | `showWhen: hasSpecificPlans=N`. Opções: Y(Anos), M(Meses), W(Semanas), D(Dias), H(<24h). inline, flexBasis:300px. |
| `usAddressHeading` | "Onde ficará hospedado nos EUA?" | `heading` | — | — | — |
| `usAddressStreet1` | Endereço nos EUA - Linha 1 | `text` | ✅ | `tbxStreetAddress1` | maxLen:40. |
| `usAddressStreet2` | Endereço nos EUA - Linha 2 | `text` | — | `tbxStreetAddress2` | maxLen:40. |
| `usAddressCity` | Cidade nos EUA | `text` | ✅ | `tbxCity` | maxLen:20. |
| `usAddressState` | Estado nos EUA | `select` | ✅ | `ddlTravelState` | optionsRef:usStates. |
| `usAddressZip` | CEP nos EUA | `text` | ✅ | `tbZIPCode` | maxLen:10. |
| `whoIsPaying` | Quem paga a viagem? | `select` | ✅ | `ddlWhoIsPaying` | Opções: S(Próprio), O(Outra pessoa), P(Empregador atual), U(Empregador nos EUA), C(Empresa/Org). |
| `payerSurname` | Sobrenome do pagador | `text` | ✅ | `tbxPayerSurname` | `showWhen: whoIsPaying=O`. maxLen:33, noSpecial, uppercase. |
| `payerGivenName` | Nome do pagador | `text` | ✅ | `tbxPayerGivenName` | `showWhen: whoIsPaying=O`. maxLen:33, noSpecial, uppercase. |
| `payerPhone` | Telefone do pagador | `phone` | ✅ | `tbxPayerPhone` | `showWhen: whoIsPaying=O`. |
| `payerEmail` | Email do pagador | `email` | ✅ | `tbxPAYER_EMAIL_ADDR` | `showWhen: whoIsPaying=O`. maxLen:50, allowNA. |
| `payerRelationship` | Relação com o pagador | `select` | ✅ | `ddlPayerRelationship` | `showWhen: whoIsPaying=O`. Opções: C(Filho/a), P(Pais), S(Cônjuge), R(Outro parente), F(Amigo), O(Outro). |
| `payerSameAddress` | Endereço do pagador = endereço residencial? | `radio` | ✅ | `rblPayerAddrSameAsInd` | `showWhen: whoIsPaying=O`. |
| `payerPersonCountry` | País do endereço do pagador | `select` | ✅ | `ddlPayerCountry` | `showWhen: payerSameAddress=N`. optionsRef:countries. |
| `payerPersonPostalCode` | CEP/Código Postal do pagador | `text` | ✅ | `tbxPayerPostalZIPCode` | `showWhen: payerSameAddress=N`. maxLen:10, allowNA. |
| `payerPersonStreet1` | Endereço do Pagador (Linha 1) | `text` | ✅ | `tbxPayerStreetAddress1` | `showWhen: payerSameAddress=N`. maxLen:40. |
| `payerPersonStreet2` | Endereço do Pagador (Linha 2) | `text` | — | `tbxPayerStreetAddress2` | `showWhen: payerSameAddress=N`. maxLen:40. Opcional. |
| `payerPersonCity` | Cidade do Pagador | `text` | ✅ | `tbxPayerCity` | `showWhen: payerSameAddress=N`. maxLen:20. |
| `payerPersonState` | Estado/Província do Pagador | `text` | — | `tbxPayerStateProvince` | `showWhen: payerSameAddress=N`. maxLen:20, allowNA. |
| `payerCompanyName` | Nome da empresa pagadora | `text` | ✅ | `tbxPayingCompany` | `showWhen: whoIsPaying=C`. maxLen:33. |
| `payerCompanyPhone` | Telefone da empresa | `phone` | ✅ | `tbxPayerPhone` | `showWhen: whoIsPaying=C`. |
| `payerCompanyRelation` | Relação com a empresa | `text` | ✅ | `tbxCompanyRelation` | `showWhen: whoIsPaying=C`. maxLen:40. |
| `payerCoCountry` | País da empresa pagadora | `select` | ✅ | `ddlPayerCountry` | `showWhen: whoIsPaying=C`. optionsRef:countries. |
| `payerCoPostalCode` | CEP/Código Postal empresa | `text` | ✅ | `tbxPayerPostalZIPCode` | `showWhen: whoIsPaying=C`. maxLen:10, allowNA. |
| `payerCoStreet1` | Endereço da Empresa (Linha 1) | `text` | ✅ | `tbxPayerStreetAddress1` | `showWhen: whoIsPaying=C`. maxLen:40. |
| `payerCoStreet2` | Endereço da Empresa (Linha 2) | `text` | — | `tbxPayerStreetAddress2` | `showWhen: whoIsPaying=C`. maxLen:40. |
| `payerCoCity` | Cidade da Empresa | `text` | ✅ | `tbxPayerCity` | `showWhen: whoIsPaying=C`. maxLen:20. |
| `payerCoState` | Estado/Província da Empresa | `text` | — | `tbxPayerStateProvince` | `showWhen: whoIsPaying=C`. maxLen:20, allowNA. |
