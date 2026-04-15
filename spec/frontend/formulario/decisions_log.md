# Form Engine: Refinamentos e Correções Críticas

Registro das decisões e correções de comportamento do FormEngine. Serve como referência para evitar regressões.

---

## 1. Correções de Robustez DOM

- Todos os scripts (`dashboard.html`, `admin.html`, etc.) incluem verificação condicional antes de modificar elementos DOM (ex: `if (el) el.innerHTML = ...`), prevenindo `Uncaught TypeError: Cannot set properties of null` em cargas assíncronas.

---

## 2. Estabilização do Engine de Arrays e Condicionais

### Arrays ("Add Another")
- Botões de gerenciamento (`+ Adicionar`, `Remover`) têm largura `fit-content` para não ocupar espaço desnecessário.
- Lógica show/hide (`showWhen`) verificada para arrays aninhados com base em radio buttons pai.

### Condicionais Verificados (100% funcional)
- **Telecode**: "Possui telecode? Sim" exibe corretamente os campos de sobrenome/nome em telecode.
- **Condições de Array**: show/hide de arrays aninhados com base em radio pai validados.
- **Visibilidade de Seção**: Seções inteiras (ex: Viagens Anteriores) ocultam/exibem corretamente o card completo.

---

## 3. Persistência e Renderização Inicial

### Bug: Formulário Vazio Após Refresh
- **Causa Raiz**: `_renderInput()` gerava campos HTML mas não vinculava `value`, `selected` ou `checked` durante `renderForm()`. Somado ao Security Gate que sobrescrevia `_applicantId` com `sessionStorage` vazio.
- **Correção**: Implementado `_resolveValue(key)` com bind direto no HTML gerado. Security Gate usa URL `?id=UUID` como fallback.

---

## 4. Correções Críticas de Lógica (MEL)

| ID | Prioridade | Correção |
|---|---|---|
| **MEL-1** | CRÍTICO | Defaults (ex: `'N'`) não sobrescrevem respostas salvas pelo usuário (ex: `'Y'`) em re-renders — aplicados apenas se o campo estiver vazio. |
| **MEL-4** | CRÍTICO | `validateSection()` e `_calcProgress()` agora incluem sub-campos obrigatórios de arrays. `_updateSectionStatus` exige `hasRequiredData` para exibir checkmark verde. |
| **MEL-2** | BAIXO | Ciclo de auto-save migrado para `visibilitychange` como fallback mais confiável que `beforeunload` para mobile. |
| **MEL-3** | BAIXO | Query de busca do portal otimizada de 4 para 2 campos (email e dados pessoais). |

---

## 5. Sincronização Profunda de Arrays e Condicionais

### Validação Profunda de Arrays
`validateSection()` foi expandido para iterar por `arrayData`. Valida sub-campos obrigatórios dentro de todas as entradas, reportando erros com índices específicos (ex: "Visitas Anteriores #1: Data de Chegada").

### Sync de Condicionais Aninhadas
`_reEvaluateAllConditionals()` resolve o bug "dado carregado mas oculto": após `renderForm()`, o engine itera por `this.data` E `this.arrayData` para disparar `_evaluateConditionals()`, garantindo que campos condicionais aninhados (ex: Número do Passaporte dentro de um array de IDs) apareçam corretamente conforme os dados hidratados.

### Contagem de Progresso de Arrays
`_calcProgress()` inclui sub-campos obrigatórios de arrays no total/preenchido, fornecendo métricas de conclusão mais precisas.

---

## 6. Integridade de Dados Condicionais

### Cleanup Recursivo e Auto-save
- `_evaluateConditionals` deleta recursivamente chaves de `this.data` e `this.arrayData` quando um container é ocultado.
- Inputs DOM dentro do bloco oculto são resetados para string vazia.
- O processo de limpeza define `dataChanged = true` e dispara `onChange` (Auto-save) imediatamente — o banco é purgado assim que o usuário muda de opção.

### Limpeza de Seção Completa
Quando uma seção inteira é ocultada (ex: Dados do Cônjuge por mudança no estado civil), o engine itera por `sec.fields` e remove todos os dados correspondentes do estado.

### Metadata de Array para Rastreamento de Estado
`data-array-key` foi adicionado ao elemento `.array-container` no DOM. Isso permite que o cleanup recursivo em `_evaluateConditionals` use `querySelectorAll('[data-array-key]')` para localizar e remover definitivamente arrays de `this.arrayData` quando o bloco pai é ocultado.

---

## 7. Accordion de Revisão (Assessor) — Persistência de Estado

### Problema
Editar um campo ou adicionar/remover itens de array dispara re-render completo da DOM de revisão (`renderReview`). O comportamento padrão fecha todas as seções ou reabre sempre a primeira.

### Solução (Ciclo de Lifecycle)
1. `openIdx = _getOpenReviewSectionIndex()` — salva índice 0-based da seção expandida.
2. `renderReview(false)` — re-renderiza com `autoOpen = false`.
3. `_restoreReviewSectionByIndex(openIdx)` — re-expande a seção anterior via `_toggleReviewSection(header, doScroll: false)`.

A abordagem por índice é mais robusta que por label, pois labels mudam dinamicamente (ex: percentuais de progresso).

---

## 8. Event Binding de Acordeões

### Problema
`addEventListener` em re-renders dinâmicos acumulava handlers duplicados no mesmo container, causando "double-toggle" (seção abria e fechava instantaneamente num único clique).

### Solução
Migração para binding direto `onclick="engine.toggleSection(idx)"` no template HTML. Garante exatamente um handler por header de seção.

---

## 9. Decommissioning do Monólito Legacy

- `index.html` (6.587 linhas) era um clone do DS-160 que não usava `FormEngine` nem `ds160-schema.js`.
- Foi deletado. `index.html` foi substituído por Landing Page leve.
- Todo tráfego de solicitantes do `portal.html` foi redirecionado para `ds160-form.html`, garantindo que 100% da coleta de dados seja schema-driven.

---

## 10. Escopo de Tipos de Visto

**Decisão:** A plataforma suporta apenas os vistos **B, F, J e O** no MVP. Qualquer outro tipo (M, H, L, P, Q, R, etc.) está fora do escopo — não deve ser implementado, testado nem planejado.

**Impacto nas seções condicionais por tipo de visto:**

| Seção | Condição original (DS-160 completo) | Condição em escopo |
|---|---|---|
| `studentExchange` | `purposeCategory in [F, J, M]` | `purposeCategory in [F, J]` |
| `studentAddContact` | `purposeOfTrip in [F1-F1, J1-J1, M1]` | `purposeOfTrip in [F1-F1, J1-J1]` |
| `temporaryWork` | `purposeCategory in [H, L, O, P, Q, R]` | `purposeCategory = O` |

---

## 11. DECISÃO PENDENTE — Dados do Grupo vs. Dados Individuais no Formulário

**Questão em aberto:** Certos campos do formulário são verdades do caso inteiro, não do indivíduo — mas hoje vivem dentro do formulário individual de cada membro. A decisão de onde colocá-los precisa ser confirmada antes ou durante o desenvolvimento.

### Campos candidatos a subir para o Case Detail (nível do caso)

| Campo | Seção atual | Por quê sobe |
|---|---|---|
| `location` | Seção 1 | Local da entrevista é igual para todos os membros |
| `purposeCategory` | Seção 4 (`travel`) | Categoria do visto (B, F, J, O) é igual para todos |
| Credenciais AIS, local CASV, datas | Seção 23 (`aisInfo`) | Dados operacionais do grupo, preenchidos pelo principal |

### Campos que ficam no formulário individual

| Campo | Por quê fica |
|---|---|
| `purposeOfTrip` | Tipo específico varia por membro — F1 para o estudante, F2 para o cônjuge, etc. |
| Todo o resto | Dados pessoais, histórico, trabalho, família, segurança |

### Regra que não muda

`purposeOfTrip` usa `filteredBy: purposeCategory`. Se a categoria vier do caso em vez do formulário, o filtro continua funcionando — só muda a fonte do valor, não a lógica.

### O que precisa ser decidido

1. O assessor preenche `location` e `purposeCategory` ao criar o caso no dashboard — ou ainda fica no formulário?
2. O solicitante principal preenche os dados AIS/CASV numa tela separada no dashboard — ou ainda via formulário?
3. Se subir para o Case Detail: o actor lê esses campos do registro do caso, não do formulário de cada membro — isso precisa estar alinhado com o schema do banco.

### Status
> ⚠️ **Não implementar nem reorganizar sem confirmar esta decisão.** Manter o estado atual (tudo no formulário individual) até que haja confirmação explícita de qual arquitetura seguir. Pode ser resolvido no início do desenvolvimento ou tratado como V2 se a complexidade não justificar no MVP.

---

## 12. Dívida Técnica Identificada

| ID | Descrição |
|---|---|
| **BUG-3** | `goBack()` para solicitantes perde o parâmetro `?secure_entry=1`, podendo impactar validação de sessão no portal ao retornar. |
| **BUG-4** | Se o token do assessor expira mid-session, a UI muda dinamicamente para `role-solicitante`, ocultando abas admin. |
| Duplicação de `sleep()` | Utilitário `sleep()` duplicado em 4 arquivos de automação. Consolidação planejada em `automation/helpers/utils.js`. |
| Console Logs | Statements `console.log` de debug permanecem em arquivos frontend de produção. |

---

## 11. V2 — Papel de Patrocinador/Custeador

**Ideia:** Criar um papel formal de "patrocinador" dentro do caso — a pessoa (membro ou externa) que financia a viagem de um ou mais solicitantes. Hoje cada membro responde individualmente quem paga a viagem (`travel.whoIsPaying`), o que funciona para casos simples. O papel de patrocinador faria sentido quando os dados do pagador precisam ser compartilhados entre múltiplos membros.

**Por que é V2:** A lógica de patrocinador tem mais relação com herança de dados do que com um papel distinto. Num grupo, membros diferentes podem ter patrocinadores diferentes — não necessariamente o solicitante principal. A análise de quando herdar, de quem herdar e como sinalizar isso no formulário precisa ser feita junto com a especificação completa de herança de dados (V2). Não tem complexidade suficiente para justificar no MVP.

**O que não muda no MVP:** `travel.whoIsPaying` continua funcionando individualmente por membro. O solicitante principal não é automaticamente o patrocinador.

---

## 12. V2 — Herança de Dados entre Membros do Caso

**Ideia:** Quando um caso tem múltiplos solicitantes (família), certos campos do formulário são idênticos para todos: data de chegada, local de hospedagem, financiador da viagem, contato nos EUA, endereço residencial. O assessor poderia pré-preencher esses campos no "Solicitante Principal" e propagá-los para os demais com um clique — ou o próprio solicitante marcaria "Mesmo do titular".

**Por que é V2:** Requer mapeamento de quais campos são herdáveis por tipo de visto, UI de sincronização no case-detail, e lógica de override (membro pode divergir do principal). Complexidade alta para o MVP.

**Campos candidatos à herança:**
- `travel`: data de chegada, duração estimada, local de hospedagem
- `usContact`: contato nos EUA (nome, endereço, telefone)
- `addressPhone`: endereço residencial (quando membros moram juntos)
- `travel`: financiador da viagem (quando o mesmo pagador cobre todos)

**Referência:** `case-detail/index.md` seção 7 — anotado como não implementado no MVP.

---

## 12. Checklist de Auditoria Funcional

Sempre que refinar ou atualizar o FormEngine, verificar:

### Lógica Condicional (`showWhen`)
- [ ] Selecionar um valor (ex: "SIM") exibe campos dependentes corretamente.
- [ ] Ocultar um campo pai oculta todos os filhos e limpa valores no objeto de dados.
- [ ] Condicionais de seção ocultam/exibem cards de accordion inteiros.
- [ ] Campos ocultos são removidos do JSON gerado.

### Gerenciamento de Arrays
- [ ] "+ Adicionar" acrescenta nova entrada em `arrayData` e re-renderiza.
- [ ] Limite `maxItems` (padrão 5) é respeitado.
- [ ] "✕ Remover" remove o índice específico e re-indexa os restantes.
- [ ] Campos internos de um array avaliam sua própria lógica condicional.

### View de Revisão (Assessor)
- [ ] Headers de seção expandem/colapsam o conteúdo de revisão.
- [ ] Valores exibem labels mapeados de select/radio.
- [ ] Campos obrigatórios vazios exibem placeholder `(vazio)`.
- [ ] Click numa linha abre input de edição inline; salvar propaga ao banco.
- [ ] Arrays na revisão têm botões funcionais de adicionar/remover.

### Estado e Sincronização
- [ ] Avançar seção (`goNext`) dispara `onSave`.
- [ ] Indicadores de sync exibem "Salvando...", "Salvo" ou "Erro".
- [ ] Progresso de seção (checkmark) atualiza em tempo real.
- [ ] Botão "Validar" exibe resumo limpo de campos obrigatórios faltantes.

### Integridade do Output
- [ ] JSON gerado corresponde à estrutura do schema sem chaves espúrias.
- [ ] Todos os dados de texto estão em maiúsculas antes da persistência.
