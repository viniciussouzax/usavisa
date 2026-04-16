# 26. Print Application (Formulário DS-160 Completo)

**URLs Típicas:** 
- `https://ceac.state.gov/GenNIV/General/ESign/Print_Application.aspx` (Ou equivalente)
**Título CEAC:** Print Application

---

## 1. Visão Geral da Entidade 

Esta tela é gerada unicamente ao clicar no botão `Print Application` a partir do Dashboard de Finalização (Página 25). 
A página é uma folha estática linear que renderiza absolutamente todas as respostas consolidadas do formulário DS-160 sob a formatação oficial do Governo Americano. Não possui inputs ou formulários (com exceção de botões *utility* do browser).

## 2. Ação de Captura (File Generation)

**O que o motor deve fazer:**
Acessada essa aba temporária, a Engine não precisa interagir via DOM (não preenche campos). O objetivo cego desta via é salvar toda a *markup* em um arquivo portável (PDF).

**Método de Extração:**
- A Engine injeta comandos no CDP (Chrome DevTools Protocol) emulando o atalho de impressão, gerando uma cópia idêntica da página completa.
- **Salvar Como:** O arquivo deve ser nomeado explicitamente acompanhado do AA Number. Ex: `AA00FE8UK3_Application.pdf`.

## 3. Retorno

**Procedimento Pós-Captura:**
Após garantir que o binário (PDF) foi escrito com sucesso no storage temporário local (/tmp ou memória), o bot deve fechar esta aba ou retroceder programaticamente para a Página 25 (Dashboard) para seguir a regra mandatória cronológica e finalmente chamar o *Print Confirmation*.
