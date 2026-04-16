# Inventário de Gatilhos de Postback CEAC

> **Natureza deste documento:** Os IDs listados aqui são **fatos sobre o formulário do governo americano (CEAC/DS-160)**, não código legado a ser copiado. O CEAC é um sistema terceiro que não controlamos. Esses elementos existem na DOM deles e disparam comportamentos reativos que qualquer motor de automação precisará respeitar.
>
> **A lógica de verificação** (como detectar e aguardar esses gatilhos) será **arquitetada do zero** na nova engine. Esses IDs servem apenas como **inventário de referência** para guiar essa implementação.

---

## O Conceito: Por que Gatilhos de Postback Importam

O formulário DS-160 é construído em ASP.NET WebForms. Determinados elementos, ao serem interagidos, enviam uma requisição síncrona ao servidor do governo (`WebForm_DoPostBackWithOptions`), que retorna um HTML parcial regenerado. Se o motor de automação prosseguir sem aguardar essa resposta, tentará interagir com elementos que já foram destruídos e recriados na DOM — causando falhas de `Node Detached`.

A nova engine precisará saber **quais elementos têm esse comportamento** para tratá-los com a devida sincronização de rede.

---

## Categoria 1: Dropdowns que Disparam Postback

Estes são campos `<select>` onde **qualquer troca de valor** recarrega seções da página.

**IDs canônicos identificados no CEAC:**
- `CNTRY`, `Country` — Seleção de países/nacionalidades
- `PurposeOfTrip`, `VisaClass`, `OtherPurpose` — Hierarquia do tipo de visto
- `Occupation` — Pode revelar seção de endereço profissional
- `PPT_TYPE` — Tipo de passaporte
- `REL_TO_APP`, `POC_REL` — Relacionamento familiar/contato
- `SocialMedia` — Tipo de rede social
- `MARITAL_STATUS`, `APP_GENDER` — Estado civil e gênero (ambos expandem ou suprimem seções)
- `WhoIsPaying`, `PayerRelationship` — Pagador da taxa
- `SpouseNatDropDownList`, `SpouseAddressType`, `SpousePOBCountry` — Dados do cônjuge

---

## Categoria 2: Radio Buttons que Disparam Postback Apenas em "SIM"

Nestes elementos, clicar em **"No" não altera o estado reativo**. Apenas a seleção de "Yes" expande novas seções e exige aguardar o servidor.

**IDs canônicos identificados no CEAC:**

*Formação e Emprego:*
- `PreviouslyEmployed`, `AttendedEduc`, `OtherEduc`

*Histórico Consular (seção mais crítica e densa):*
- `PREV_US_TRAVEL_IND`, `PREV_US_DRIVER_LIC_IND`
- `PREV_VISA_IND`, `PREV_VISA_REFUSED_IND`, `PREV_VISA_LOST`, `PREV_VISA_CANCELLED`
- `IV_PETITION_IND`, `PERM_RESIDENT_IND`, `VWP_DENIAL_IND`

*Listas dinâmicas ("Add Another"):*
- `AddPhone`, `AddEmail`, `AddSocial`, `AddSite`
- `OTH_NATL`, `OtherNames`, `OtherPersonsTravelingWithYou`

*Condicionais familiares, legais e militares:*
- `TelecodeQuestion`, `PermResOtherCntryInd`, `GroupTravel`
- `LOST_PPT_IND`, `OTHER_PPT_IND`
- `FATHER_LIVE_IN_US_IND`, `MOTHER_LIVE_IN_US_IND`, `OTHER_RELATIVE_IND`
- `CLAN_TRIBE_IND`, `COUNTRIES_VISITED_IND`, `ORGANIZATION_IND`
- `SPECIALIZED_SKILLS_IND`, `MILITARY_SERVICE_IND`, `INSURGENT_ORG_IND`
- `PayerAddrSameAsInd`

---

## Categoria 3: Radio Buttons que Disparam Postback em Qualquer Valor

Nestes elementos, **qualquer clique** — seja "Yes" ou "No" — regenera a UI. A nova engine deve tratar **toda interação** com esses IDs como um evento assíncrono pendente.

**IDs canônicos identificados no CEAC:**
- `SpecificTravel` — Alterna entre endereço genérico e logística detalhada de viagem
- `IMMED_RELATIVE`
- `MailingAddrSame`, `MailingAddr` — Define se o endereço de correspondência é igual ao residencial

---

## Diretriz para a Nova Engine

A nova arquitetura **não deve replicar** a lógica `isPostbackSelect()` / `isPostbackClick()` como funções utilitárias soltas. Em vez disso:

- Esses IDs devem ser configurados como **metadados estáticos** (ex: um arquivo JSON ou constantes tipadas).
- A camada de **interação do clicador** (ex: uma classe `Interactor` ou middleware do Playwright) consultará esses metadados antes de cada ação e decidirá autonomamente se deve ou não sincronizar com a rede — sem que o código de preenchimento de página precise saber disso.
