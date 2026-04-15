# Nível 3: Formulário Individual (FormEngine)

> **⚠️ Fase 5 — não implementado ainda.** Hoje existe apenas um placeholder com ~10 campos genéricos em `/[shortId]/{token}`. O engine completo descrito abaixo + os 23 arquivos de schema em [./schema/](./schema/) é o plano de construção da Fase 5.

Esta camada é o "coração" da compatibilidade consular. O motor do formulário (`FormEngine`) renderiza dinamicamente o DS-160 baseado unicamente no schema. Esta página serve como interface unificada tanto para o **Assessor** (Modo Revisão/Edição) quanto para o **Solicitante** (Preenchimento).

## Contextos de montagem

O mesmo componente `<SolicitanteForm>` roda em 3 contextos:

| Contexto | URL/localização | Modo | Diferenças |
|----------|-----------------|------|------------|
| Drawer do assessor | `/[shortId]/solicitacoes/[id]` → click na linha | `accordion` | Edição livre, salva direto |
| Público via link do caso | `/[shortId]/{case_token}/s/{applicant_uid}` | `pages` | Botão "Voltar ao caso" |
| Público via link individual | `/[shortId]/{applicant_token}` | `pages` | Sem navegação pra outros membros |

## Arquitetura de Dados
- **Motor Central**: Onde ocorre a lógica de renderização HTML dinâmica, controle de estado e sincronização com o BD.
- **Schema**: Definição de campos e amarrações lógicas de visibilidade (A bússola do motor).
- **Validação**: Regras de integridade para zerar as margens de erro no preenchimento final.

## Regras de Lógica Condicional e Limpeza
O gerador lida com a visibilidade de campos (ex: "Tem outros nomes? Se Sim, mostre X") de forma extremamente rigorosa:

1. **`showWhen` (Condicionais)**: Gatilhos reavaliados a cada "input" do usuário, na carga da página e após edições. Utilizam as classes CSS `.cond-block` e `.visible` para controle visual.
2. **Prune-on-Hide (A Política Mais Crítica)**: Sempre que uma seção ou campo for HIDDEN (escondido) por falhar na condicional `showWhen`, o formulário tem a instrução de caçar e **apagar (zerar)** o valor daquele campo do `data` (e `arrayData` no caso de listas). Isso previne a "sujeira invisível" no JSON final.
3. **Resincronização (Post-Render Sync)**: Por precaução contra bugs de hidratação e race conditions no carregamento, o sistema passa um "pente fino" forçando o re-trigger da lógicas depois que a página HTML já carregou inteira.

## Arrays (Estruturas de Repetição)
A engine isola itens repetitivos (Viagens Anteriores, Membros da Família, Escolas) em um objeto próprio chamado `arrayData`.
- Valores aninhados dentro de sub-listas entram na obrigatoriedade dos **100% preenchidos**. O campo sinaliza "Checado (Verde)" para a seção apenas se todas as listas de arrays tiverem preenchido dados necessários sem gaps.

## Sanitização Nativa
Processamento de dados cruciais aplicados automaticamente ao digitar:
- **Global Uppercase**: Todo formulário, sendo espelho consular, converte dinamicamente em *UPPERCASE* (letras maiúsculas) todos os textos puros durante a digitação e a edição (com exceção de e-mails/senhas).
- **Sanitização BR**: A adequação regional na exibição de hints e na quebra de nomes brasileiros (Surnames vs Given Names) exigidos pela imigração.

## Comportamento Baseado no Role (Modo de Visualização)
- A tela verifica o parâmetro `tab` na URL em conjunto com o status da sessão para renderizar ou o Formulário Longo (solicitante) ou o Modo Acordeão (Assessor).
- **Modo Revisão (Assessor)**: Permite visualizações rápidas de todas as respostas com Edição Inline (Pill Toggles) para corrigir um erro num campo isolado (como um DD/MM/AAAA incorreto) e sincronizar em background via `PATCH` para o Supabase imediatamente após a edição.
- A persistência (Autosave e Visibilitychange) re-salva os dados assim que a aba perde o foco para não permitir perdas de dados vitais.

---
**[➡ Consultar Schema Completo (índice de seções)](./schema/index.md)**
