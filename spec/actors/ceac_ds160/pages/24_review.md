# 24. Review (Revisão da Solicitação)

**URLs Típicas:** 
- `https://ceac.state.gov/GenNIV/General/complete/ReviewPage.aspx`
- `https://ceac.state.gov/GenNIV/General/complete/Review.aspx`
**Título CEAC:** Application Review

---

## 1. Visão Geral da Entidade 

Esta transição serve como uma barreira final ("Sanity Check") arquitetada pelo Departamento de Estado antes da oficialização jurídica. 
A página é formatada visualmente como abas ou acordeões longos listando todos os blocos de respostas inseridos pelo usuário no preenchimento (Personal, Travel, Family, etc).

O CEAC impõe rotinas de verificação ("Next: X") iterativamente para cada um dos blocos, forçando uma confirmação de visualização até alcançar o estágio final de `Sign and Submit`.

## 2. Ação de Roteamento (Automação Cega)

**O que o motor deve fazer:**
Em modos de Automação Headless ou API-driven, o robô já possui garantia de que a injeção condicional do schema o levou até aqui sem alert rows. Dessa forma, a responsabilidade do robô na aba de Review limita-se inteiramente ao **Bypass**.

A Engine deve ser construída para varrer a DOM visível em busca do respectivo link de progressão para o próximo contêiner ou simplesmente caçar ativamente a passagem final.

**Alvos Clicáveis Padrões (Bypass Sequence):**
- A engine deve focar em localizar botões/âncoras que avancem estritamente em direção à assinatura.
- **ID Alvo (Exemplo Padrão):** O botão de rodapé que assume IDs como `ctl00_SiteContentPlaceHolder_UpdateButton3` (mesmo nomeclador genérico que representa o `Next`). Em iterativas, clica-se repetidas vezes conforme o CEAC re-renderiza a aba "Next: Travel", "Next: Background", etc.

## 3. Estado de Exceção (Modo Edição)

> **Cenário de Perigo:** Caso o robô acidentalmente dispare o comando `Edit Information` em qualquer um dos blocos nesta página, o CEAC anulará a assinatura e exigirá que aquele módulo volte a ser submetido até transitar para Review novamente. O robô em operação primária NUNCA deve engatilhar âncoras de `Edit`.

## 4. Retorno ao Fluxo
Vencida a cadeia de cliques "Next" da auditoria final, a sessão transacionará invariavelmente para a aba `Sign and Submit` (Página 25).
