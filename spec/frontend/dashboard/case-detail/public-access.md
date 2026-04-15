# Acesso Público do Caso — Experiência do Solicitante

Documentação das duas páginas acessíveis sem login: a página do caso (link aberto) e o formulário individual (link específico).

---

## 1. Página do Caso — `/{shortId}/{case_token}`

### Quem acessa
Qualquer pessoa com o link do caso compartilhado pelo assessor. Normalmente a família inteira via grupo de WhatsApp, email ou similar.

### O que é exibido

```
┌─────────────────────────────────────────────────┐
│  [ Logo da assessoria ]                         │
│                                                 │
│  Família Silva — Jul/2025                       │
│  Entrevista: 15 de Julho de 2025 · São Paulo    │
│  Visto: B1/B2                                   │
├─────────────────────────────────────────────────┤
│  👤 João Silva         Titular    ██████░  80%  │
│  👤 Maria Silva        Cônjuge    ████░░░  55%  │
│  👤 Pedro Silva        Filho      ░░░░░░░   0%  │
└─────────────────────────────────────────────────┘
```

| Elemento | Detalhe |
|---|---|
| Logo | Whitelabel da assessoria |
| Nome do caso | Definido pelo assessor |
| Data e cidade da entrevista | Definidos pelo assessor |
| Tipo de visto | Definido pelo assessor |
| Lista de membros | Nome completo · Relação · Barra de progresso + % |

### O que NÃO é exibido
- Dados do formulário de nenhum membro
- Informações de passaporte, CPF, endereço ou qualquer dado pessoal
- Interface do assessor ou qualquer painel administrativo

### Interação
- Clicar em qualquer linha da lista → abre o formulário DS-160 daquele membro
- Não há confirmação de identidade — o link do caso é o controle de acesso
- Página sem navegação lateral, sem login, sem header de sistema

### Estados da página

| Estado do link | O que aparece |
|---|---|
| Ativo | Página normal com lista de membros |
| Revogado (manual ou automático) | Página de aviso: *"O acesso a este caso foi encerrado. Entre em contato com sua assessoria."* |
| Token inválido / não encontrado | Página 404 genérica |

---

## 2. Formulário Individual via Link do Caso *(Fase 4)*

Ao clicar numa linha da página do caso, o formulário abre com a URL:

```
{NEXT_PUBLIC_BASE_URL}/{shortId}/{case_token}/s/{applicant_uid}
```

O `case_token` valida que o acesso é legítimo. O `applicant_uid` identifica qual formulário carregar.

### Interface do formulário neste modo

- Modo `solicitante` — sem abas de assessor, sem accordion de revisão
- Navegação por seções (modo `pages`): Anterior / Próximo
- Auto-save ativo (1,5s debounce + save imediato ao sair)
- Botão **"← Voltar ao caso"** no topo — retorna para `/c/{case_token}`
- Sem botão de finalizar/submeter — essa ação é exclusiva do assessor

### O que o solicitante pode fazer

| Ação | Permitido |
|---|---|
| Preencher qualquer seção do formulário | ✅ |
| Salvar progresso automaticamente | ✅ |
| Voltar e continuar pelo mesmo link do caso | ✅ |
| Ver progresso dos outros membros (só %) | ✅ via página do caso |
| Ver dados do formulário de outros membros | ❌ |
| Adicionar ou remover membros do caso | ❌ |
| Finalizar / submeter para o consulado | ❌ |
| Revogar ou alterar o link | ❌ |

---

## 3. Formulário Individual via Link Específico — `/{shortId}/{applicant_token}` *(Fase 4)*

Acesso direto ao formulário de um membro sem passar pela página do caso.

### Diferenças em relação ao acesso via link do caso

| | Via link do caso | Via link individual |
|---|---|---|
| URL | `/{shortId}/{case_token}/s/{applicant_uid}` | `/{shortId}/{applicant_token}` |
| Botão "Voltar ao caso" | ✅ presente | ❌ ausente |
| Acesso à página do caso | ✅ possível | ❌ impossível |
| Vê outros membros | ✅ ao voltar | ❌ nunca |
| Token exposto | `case_token` na URL | `applicant_token` isolado |

### Uso típico
O titular do caso recebeu o link do caso mas quer enviar o link apenas para o filho preencher o próprio formulário — sem que o filho veja os dados de progresso dos pais ou acesse os formulários deles. Compartilha o link individual do filho.

### Interface
- Idêntica ao formulário aberto pelo link do caso
- Sem botão "Voltar ao caso"
- Sem nenhuma referência visual ao caso ou aos outros membros

---

## 4. Ciclo de Vida do Acesso

```
Assessor cria o caso
  → case_token gerado automaticamente
  → applicant_token gerado por solicitante ao adicionar

Assessor compartilha os links
  → Links ativos desde a criação

Solicitantes preenchem os formulários
  → Progresso atualiza em tempo real na página do caso

Todos os solicitantes atingem 100%
  → Acesso revogado automaticamente (toggle vira "Revogado")
  → Links param de funcionar (página de "acesso encerrado")

Assessor pode reativar manualmente
  → Toggle de volta para "Ativo"
  → Links voltam a funcionar com os mesmos tokens

Assessor gera novo link (caso de link vazado)
  → Novo case_token criado
  → Links antigos param de funcionar imediatamente
  → Assessor precisa recompartilhar o novo link
```

---

## 5. Segurança do Modelo

| Aspecto | Decisão |
|---|---|
| Formato do token | UUID v4 — aleatório, não sequencial, não adivinhável |
| Modelo de acesso | "Senha por URL" — equivalente ao Google Docs "qualquer pessoa com o link" |
| Dados expostos publicamente | Apenas nome + relação + % de progresso |
| Dados do formulário | Nunca expostos na página pública |
| Revogação | Imediata — flag no banco, token não muda |
| Novo token | Só ao clicar "Gerar novo link" explicitamente |
| Isolamento individual | Link `/f/{applicant_token}` não expõe `case_token` |
