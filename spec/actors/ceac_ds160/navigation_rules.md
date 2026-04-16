# Matriz Global de Navegação (Routing Guidelines)

Este documento especifica o macro-comportamento roteador do formulário. Ele rege **quais páginas inteiras irão aparecer ou desaparecer** na jornada do aplicante ou do motor dinâmico baseado em uma combinação de variáveis primárias (Demografia, Localidade e Categoria Consular). 

> [!TIP] Escopo de Cobertura e Flexibilidade de Vistos
> A arquitetura e a modulação adotadas nesta Spec foram pensadas para **nativamente permitir qualquer visto Não-Imigrante** (todos os que exigem o DS-160).
> Não há trava tecnológica a 1 ou 2 tipos. No entanto, por questões de foco comercial e de fluxo, a validação de arquitetura **prioriza o mapeamento ativo das classes: B (Turismo/Negócios/Tratamentos Médicos), F, J, M (Estudos/Intercâmbios) e O.**
> *Nota: Variações ainda não intensamente mapeadas (como M) seguem o esqueleto padrão e podem exigir calibração empírica dos módulos de ramificação ao entrarem em produção.*

O fluxo normal (baseline) é concebido sempre sob a ótica do visto B (Turismo/Negócios) para maiores de idade.Qualquer implementação do motor (Filler) ou construção de front-end dinâmico no portal do usuário deve considerar como mandatórias as seguintes ramificações (Bypass/Skip rules):

## 1. Fluxograma de Decisão Global (State Machine)

```mermaid
flowchart TD
    %% Nós Básicos
    Start((Início))
    Apply[01 Apply]
    Personal[04 & 05 Personal]
    Travel[06 Travel]
    Contact[11 US Contact]
    Family[12 Family Parents]
    Security[19 Security & Background]
    Photo[23 Photo]
    End((Fim))

    %% Decisões
    DC_Location{Posto é RCF?}
    DC_Marital{Casado/Viúvo/Sep?}
    DC_Age{Idade < 14?}
    DC_Visa{Qual Visto?}
    DC_StudentRole{Principal ou Dependente?}
    DC_PTA{Posto PTA/RCF?}

    %% Nós Ocultos/Específicos
    Modal[Modal PE RECIFE]
    Spouse[13/14/15 Spouse Pages]
    Work[16/17/18 Work & Edu]
    Sevis[20 Student SEVIS]
    AddContact[21 Student Add Contact]
    TempWork[22 Temporary Work]

    %% Fluxo de Setup
    Start --> Apply
    Apply --> DC_Location
    DC_Location -- Sim --> Modal
    DC_Location -- Não --> Personal
    Modal --> Personal

    %% Fluxo Base
    Personal --> Travel --> Contact --> Family

    %% Bifurcação Civil
    Family --> DC_Marital
    DC_Marital -- Sim --> Spouse
    DC_Marital -- Não --> DC_Age
    Spouse --> DC_Age

    %% Bifurcação Idade
    DC_Age -- "Menor de 14" --> Security
    DC_Age -- "Maior ou = 14" --> Work
    Work --> Security

    %% Bifurcação de Visto (The Big Branch)
    Security --> DC_Visa
    DC_Visa -- "B1/B2" --> DC_PTA
    DC_Visa -- "O1/O2/etc" --> TempWork
    DC_Visa -- "F/M/J" --> Sevis

    TempWork --> DC_PTA

    %% Filtro Estrito para Estudantes
    Sevis --> DC_StudentRole
    DC_StudentRole -- "Dependente (Fx, Jx, Mx)" --> DC_PTA
    DC_StudentRole -- "Principal (F1, J1, M1)" --> AddContact
    AddContact --> DC_PTA

    %% Foto Condicional
    DC_PTA -- Sim --> Photo
    DC_PTA -- Não --> End
    Photo --> End

    %% Styling
    classDef conditional fill:#f9f,stroke:#333,stroke-width:2px;
    class DC_Location,DC_Marital,DC_Age,DC_Visa,DC_StudentRole,DC_PTA conditional;
```

## 2. Gatilhos Demográficos
- **Isenção Sub-14 (Work/Education Skip):**
  Se a "Data de Nascimento" calcular que a idade atual do aplicante é rigorosamente **menor que 14 anos**, as 3 páginas da seção inteira de *Work/Education/Training* (Current, Previous, e Additional) serão suprimidas da rodada do CEAC. A navegação salta de Family/Relatives direto para *Security and Background*.
- **Expansão de Relacionamento (Estado Civil):**
  Se a resposta em "Marital Status" for configurada como `Casado`, `Viúvo`, `Separado` ou `Divorciado`, o roteiro adicionará forçosamente, após a seção Parents, a respectiva página extra familiar que colherá as informações do parceiro atrelado (Info Cônjuge Atual, Cônjuge Anterior ou Cônjuge Falecido). Solteiros não ativam essa rota.

## 3. Gatilhos de Localidade Congestionada (Consulado)
Políticas específicas regionais disparam alterações na primeira (Apply) ou última (Photo) tela. Dependendo do posto consular escolhido (Location), teremos modificadores de fluxo isolados:
- **Exigência Digital de Foto (PTA / RCF):**
  Se a região selecionada no passo principal (01_Apply) for Porto Alegre (PTA) ou Recife (RCF), a página final de "Upload Photo" tornar-se-á **obrigatória** na via antes do *Review*, bloqueando quem não preparou mídia digital antecipadamente.
- **Intercepção de Modal Pré-Captcha (Exclusivo RCF):**
  Ao selecionar a localidade Recife, o gateway inicial ASP.NET empurrará um *Modal* HTML imediato contendo anúncios do posto. O robô (ou a UI) é forçado a interagir despachando um "fechar" na UI explícito antes que a caixa de Captcha esteja em um estado renderizável/focado habilitando a sequência.

## 4. Gatilhos de Categoria de Visto (Visa Classes)
A categoria de visto dita o esqueleto final da aplicação:
- **Baseline (Visão Padrão B1/B2):**
  O esqueleto macro que percorre Personal -> Travel -> US Contact -> Family -> Work -> Security é a "Base B". Todos os vistos iniciam consumindo inteiramente a Base B.
- **Ramificações Condicionais Específicas (Vistos O, F, J e Ramificações Dependentes):**
  A engine nunca deve agregar módulos baseando-se em listas injetadas no fim da esteira. Regras estritas de ramificação ocorrem ao final da sessão Security:
  - **Vistos Temporários de Trabalho (O1, O2):** Ganham a ramificação exclusiva *Temporary Work*.
  - **Vistos de Estudante e Intercâmbio (F, M, J):** Todas as classes F, M e J ativam de pronto a tela *Student/Exchange SEVIS*. 
  - **Filtro Estrito Principal vs. Dependente (Student Add Contact):** *Somente* os requerentes Principais (Ex: F1, J1, M1) acessarão a rota *Student Add Contact* (onde preenchem 2 pontos de contato da Universidade/Sponsor). Se a automação notar tratar-se de um portador *Dependente Familiar* acompanhante (Ex: F2, J2, M2), ela deverá obrigatoriamente ocultar esse nó e dar Skip/Bypass, saltando direto para Photo Upload. Dependentes nunca declaram contato escolar americano.
