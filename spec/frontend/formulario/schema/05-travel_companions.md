# Seção 5: `travelCompanions` — Acompanhantes de Viagem

| id | label | type | req | ds160 | notas |
|---|---|---|---|---|---|
| `travelingWithOthers` | Viaja com outras pessoas? | `radio` | ✅ | `rblOtherPersonsTravelingWithYou` | Hint: inclui familiares, amigos, qualquer acompanhante. |
| `partOfGroup` | Faz parte de um grupo? | `radio` | ✅ | `rblGroupTravel` | `showWhen: travelingWithOthers=Y`. |
| `groupName` | Nome do grupo | `text` | ✅ | `tbxGroupName` | `showWhen: partOfGroup=Y`. maxLen:40. |
| `companions` | Acompanhantes | `array` | — | `dlTravelCompanions` | `showWhen: partOfGroup=N`. maxItems:5. |
| └ `givenName` | Nome | `text` | ✅ | `tbxTC_GIVEN_NAME` | maxLen:33, noSpecial, uppercase. |
| └ `surname` | Sobrenome | `text` | ✅ | `tbxTC_SURNAME` | maxLen:33, noSpecial, uppercase. |
| └ `relationship` | Relação | `select` | ✅ | `ddlTCRelationship` | optionsRef:relationships. |
