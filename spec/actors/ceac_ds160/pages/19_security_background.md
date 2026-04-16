# 19. Security and Background (Parts 1–5)

**URLs:**
- Part 1: `https://ceac.state.gov/GenNIV/General/complete/complete_securityandbackground1.aspx`
- Part 2: `https://ceac.state.gov/GenNIV/General/complete/complete_securityandbackground2.aspx`
- Part 3: `https://ceac.state.gov/GenNIV/General/complete/complete_securityandbackground3.aspx`
- Part 4: `https://ceac.state.gov/GenNIV/General/complete/complete_securityandbackground4.aspx`
- Part 5: `https://ceac.state.gov/GenNIV/General/complete/complete_securityandbackground5.aspx`

**Navegação:** Back → Work/Education: Additional | Next → (Visa-type specific pages)

---

## Padrão dominante desta seção

Todas as perguntas seguem **exatamente o mesmo template**:

```
rbl{Campo}        → radio Y/N
  ├── "Y" → ShowHideDiv('...{campo}', 'on')  → exibir textarea tbx{Campo}
  └── "N" → ShowHideDiv('...{campo}', 'off') → ocultar textarea tbx{Campo}
```

- **Default:** `N` (marcado como `checked`)
- **Textarea:** maxlength=4000, height=65px, width=300px
- **Prefixo base de todos os IDs:** `ctl00_SiteContentPlaceHolder_FormView1_`

> A engine deve aplicar o campo condicional `Explain` **somente quando** o radio correspondente estiver em `Y`.

---

## PART 1 — Saúde

**URL:** `...securityandbackground1.aspx`

### Q1: Communicable Disease

| Campo | ID |
|-------|----|
| Radio group | `rblDisease` |
| Radio Y | `rblDisease_0` |
| Radio N | `rblDisease_1` |
| Textarea Explain | `tbxDisease_EXPL` |

**Pergunta:** Do you have a communicable disease of public health significance?

---

### Q2: Mental or Physical Disorder

| Campo | ID |
|-------|----|
| Radio group | `rblDisorder` |
| Radio Y | `rblDisorder_0` |
| Radio N | `rblDisorder_1` |
| Textarea Explain | `tbxDisorder_EXPL` |

**Pergunta:** Do you have a mental or physical disorder that poses or is likely to pose a threat to the safety or welfare of yourself or others?

---

### Q3: Drug Abuser or Addict

| Campo | ID |
|-------|----|
| Radio group | `rblDruguser` |
| Radio Y | `rblDruguser_0` |
| Radio N | `rblDruguser_1` |
| Textarea Explain | `tbxDruguser_EXPL` |

**Pergunta:** Are you or have you ever been a drug abuser or addict?

---

**Navegação Part 1:**

| Botão | ID | Destino |
|-------|----|---------|
| Back  | `UpdateButton1` | Work/Education: Additional |
| Save  | `UpdateButton2` | — |
| Next  | `UpdateButton3` | Security/Background Part 2 |

---

## PART 2 — Crime / Tráfico Humano

**URL:** `...securityandbackground2.aspx`

### Q4: Arrested or Convicted

| Campo | ID |
|-------|----|
| Radio group | `rblArrested` |
| Textarea Explain | `tbxArrested_EXPL` |

**Pergunta:** Have you ever been arrested or convicted for any offense or crime, even though subject of a pardon, amnesty, or other similar action?

---

### Q5: Controlled Substances Violation

| Campo | ID |
|-------|----|
| Radio group | `rblControlledSubstances` |
| Textarea Explain | `tbxControlledSubstances_EXPL` |

**Pergunta:** Have you ever violated, or engaged in a conspiracy to violate, any law relating to controlled substances?

---

### Q6: Prostitution / Commercialized Vice

| Campo | ID |
|-------|----|
| Radio group | `rblProstitution` |
| Textarea Explain | `tbxProstitution_EXPL` |

**Pergunta:** Are you coming to the United States to engage in prostitution or unlawful commercialized vice or have you been engaged in prostitution or procuring prostitutes within the past 10 years?

---

### Q7: Money Laundering

| Campo | ID |
|-------|----|
| Radio group | `rblMoneyLaundering` |
| Textarea Explain | `tbxMoneyLaundering_EXPL` |

**Pergunta:** Have you ever been involved in, or do you seek to engage in, money laundering?

---

### Q8: Human Trafficking

| Campo | ID |
|-------|----|
| Radio group | `rblHumanTrafficking` |
| Textarea Explain | `tbxHumanTrafficking_EXPL` |

**Pergunta:** Have you ever committed or conspired to commit a human trafficking offense in the United States or outside the United States?

---

### Q9: Assisted Severe Trafficking

| Campo | ID |
|-------|----|
| Radio group | `rblAssistedSevereTrafficking` |
| Textarea Explain | `tbxAssistedSevereTrafficking_EXPL` |

**Pergunta:** Have you ever knowingly aided, abetted, assisted or colluded with an individual who has committed, or conspired to commit a severe human trafficking offense?

---

### Q10: Relative of Human Trafficker

| Campo | ID |
|-------|----|
| Radio group | `rblHumanTraffickingRelated` |
| Textarea Explain | `tbxHumanTraffickingRelated_EXPL` |

**Pergunta:** Are you the spouse, son, or daughter of an individual who has committed or conspired to commit a human trafficking offense and have you within the last five years, knowingly benefited from the trafficking activities?

---

**Navegação Part 2:**

| Botão | ID | Destino |
|-------|----|---------|
| Back  | `UpdateButton1` | Security/Background Part 1 |
| Next  | `UpdateButton3` | Security/Background Part 3 |

---

## PART 3 — Terrorismo / Espionagem

**URL:** `...securityandbackground3.aspx`

### Q11: Illegal Activity (Espionagem/Sabotagem)

| Campo | ID |
|-------|----|
| Radio group | `rblIllegalActivity` |
| Textarea Explain | `tbxIllegalActivity_EXPL` |

**Pergunta:** Do you seek to engage in espionage, sabotage, export control violations, or any other illegal activity while in the United States?

---

### Q12: Terrorist Activity

| Campo | ID |
|-------|----|
| Radio group | `rblTerroristActivity` |
| Textarea Explain | `tbxTerroristActivity_EXPL` |

**Pergunta:** Do you seek to engage in terrorist activities while in the United States or have you ever engaged in terrorist activities?

---

### Q13: Terrorist Support (financeiro)

| Campo | ID |
|-------|----|
| Radio group | `rblTerroristSupport` |
| Textarea Explain | `tbxTerroristSupport_EXPL` |

**Pergunta:** Have you ever or do you intend to provide financial assistance or other support to terrorists or terrorist organizations?

---

### Q14: Terrorist Organization (membro)

| Campo | ID |
|-------|----|
| Radio group | `rblTerroristOrg` |
| Textarea Explain | `tbxTerroristOrg_EXPL` |

**Pergunta:** Are you a member or representative of a terrorist organization?

---

### Q15: Relative of Terrorist

| Campo | ID |
|-------|----|
| Radio group | `rblTerroristRel` |
| Textarea Explain | `tbxTerroristRel_EXPL` |

**Pergunta:** Are you the spouse, son, or daughter of an individual who has engaged in terrorist activity, including providing financial assistance or other support to terrorists or terrorist organizations, in the last five years?

> ⚠️ O dump da Part 3 tem 506 linhas — os campos Q14 e Q15 foram extraídos das linhas 145–200. Campos adicionais da Part 3 (linhas 200–506) seguem o mesmo padrão `rbl/tbx`. Adicionados via schema scan:
- `rblGenocide`: Have you ever ordered, incited, committed, assisted, or otherwise participated in genocide?
- `rblTorture`: Have you ever committed, ordered, incited, assisted, or otherwise participated in torture?
- `rblExViolence`: Have you committed, ordered, incited, assisted, or otherwise participated in extrajudicial killings, political killings, or other acts of violence?
- `rblChildSoldier`: Have you ever engaged in the recruitment or the use of child soldiers?
- `rblReligiousFreedom`: Have you, while serving as a government official, been responsible for or directly carried out, at any time, particularly severe violations of religious freedom?
- `rblPopulationControls`: Have you ever been directly involved in the establishment or enforcement of population controls forcing a woman to undergo an abortion against her free choice or a man or a woman to undergo sterilization against his or her free choice?
- `rblTransplant`: Have you ever been directly involved in the coercive transplantation of human organs or bodily tissue?

---

**Navegação Part 3:**

| Botão | ID | Destino |
|-------|----|---------|
| Back  | `UpdateButton1` | Security/Background Part 2 |
| Next  | `UpdateButton3` | Security/Background Part 4 |

---

## PART 4 — Fraude / Deportação

**URL:** `...securityandbackground4.aspx`

### Q16: Immigration Fraud

| Campo | ID |
|-------|----|
| Radio group | `rblImmigrationFraud` |
| UpdatePanel | `upnlImmigrationFraud` |
| Div container | `ShowDivImmigrationFraud` |
| Textarea Explain | `tbxImmigrationFraud_EXPL` |

**Pergunta:** Have you ever sought to obtain or assist others to obtain a visa, entry into the United States, or any other United States immigration benefit by fraud or willful misrepresentation or other unlawful means?

---

### Q17: Removed or Deported

| Campo | ID |
|-------|----|
| Radio group | `rblDeport` |
| UpdatePanel | `upnlDeport` |
| Div condicional | `deport` |
| Textarea Explain | `tbxDeport_EXPL` |

**Pergunta:** Have you ever been removed or deported from any country?

> ⚠️ **Nota:** A Part 4 contém UpdatePanels individuais por seção (`upnlRemoval`, `upnlImmigrationFraud`, `upnlFailToAttend`, `upnlViolateVisa`, `upnlDeport`). A engine deve responder as seguintes questoes adicionais identificadas:
- `rblRemovalHearing`: Have you ever been ordered removed from the U.S. or been Deported?
- `rblFailToAttend`: Have you ever failed to attend a hearing on removability or inadmissibility within the last five years?
- `rblVisaViolation`: Have you ever been unlawfully present, overstayed the amount of time granted by an immigration official or otherwise violated the terms of a U.S. visa?

---

**Navegação Part 4:**

| Botão | ID | Destino |
|-------|----|---------|
| Back  | `UpdateButton1` | Security/Background Part 3 |
| Next  | `UpdateButton3` | Security/Background Part 5 |

---

## PART 5 — Custódia / Votação / Renúncia

**URL:** `...securityandbackground5.aspx`

### Q18: Child Custody Withheld

| Campo | ID |
|-------|----|
| Radio group | `rblChildCustody` |
| Textarea Explain | `tbxChildCustody_EXPL` |

**Pergunta:** Have you ever withheld custody of a U.S. citizen child outside the United States from a person granted legal custody by a U.S. court?

---

### Q19: Voting Violation

| Campo | ID |
|-------|----|
| Radio group | `rblVotingViolation` |
| Textarea Explain | `tbxVotingViolation_EXPL` |

**Pergunta:** Have you voted in the United States in violation of any law or regulation?

---

### Q20: Renounced U.S. Citizenship (Tax Avoidance)

| Campo | ID |
|-------|----|
| Radio group | `rblRenounceExp` |
| Textarea Explain | `tbxRENOUNCE_EXPL` |

**Pergunta:** Have you ever renounced United States citizenship for the purposes of avoiding taxation?

> ⚠️ A Part 5 contém `upnlReimburse`. Incluída a questão de dependência `rblAttWoReimb`: Have you ever attended a public elementary school on student (F) status or a public secondary school after November 30, 1996 without reimbursing the school?

---

**Navegação Part 5:**

| Botão | ID | Destino |
|-------|----|---------|
| Back  | `UpdateButton1` | Security/Background Part 4 |
| Next  | `UpdateButton3` | Temporary Work Visa (ou próxima página conforme tipo de visto) |

---

## Resumo de campos por parte

| Part | Qtd. de perguntas | Padrão |
|------|-------------------|--------|
| 1 | 3 | `ShowHideDiv` client-side |
| 2 | 7 | `ShowHideDiv` client-side |
| 3 | 5+ | `ShowHideDiv` client-side |
| 4 | 2 (confirmados) | `ShowHideDiv` + UpdatePanels condicionais |
| 5 | 3 (+ 1 upnl vazio) | `ShowHideDiv` client-side |

> **Estratégia de automação:** Para todas as 5 partes, a engine deve:
> 1. Selecionar `N` em cada radio button (default já é N, mas confirmar preenchimento)
> 2. Se o perfil indicar `Y` para alguma questão, selecionar `Y` e aguardar o `ShowHideDiv` antes de preencher o textarea
> 3. Verificar UpdatePanels da Part 4 — se vazios, ignorar; se populados, mapear e preencher
