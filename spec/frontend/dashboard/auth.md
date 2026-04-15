# Autenticação — Login e Recuperação de Senha

Cobre todas as telas de acesso ao dashboard: login, recuperação e redefinição de senha. Não existe auto-cadastro — contas de assessor são criadas pelo Master via UI.

> **Stack:** Better Auth (não Supabase) gerencia sessions, password hashing e reset tokens. Emails transacionais via Resend.

---

## 1. Tela de Login

**URLs:**
- `/signin` — login do master (sem branding)
- `/[shortId]/signin` — login branded por organização (assessores entram por aqui)

### Campos

| Campo | Tipo | Validação |
|---|---|---|
| Email | email | formato válido, obrigatório |
| Senha | password | não vazio, obrigatório |

### Comportamento

- Botão **"Entrar"** — desabilitado até ambos os campos terem conteúdo
- Submit via Enter no campo de senha
- Após autenticação bem-sucedida → `resolveHomeUrl(userId, role)` determina destino:
  - `master` → `/organizacoes`
  - assessor com membership → `/[shortId]/solicitacoes` (shortId da primeira org ativa do user)
  - sem membership → `/` (landing)

### Estados de Erro

| Situação | Mensagem exibida |
|---|---|
| Email não encontrado | "Email ou senha incorretos" *(genérico — não revela qual campo falhou)* |
| Senha incorreta | "Email ou senha incorretos" |
| Conta inativa / bloqueada | "Conta desativada. Entre em contato com o administrador." |
| Falha de rede | "Não foi possível conectar. Verifique sua conexão." |

### Elementos da tela

```
[ Logo da plataforma ]

Email
[_________________________________]

Senha
[_________________________________]  [ 👁 mostrar ]

                    [ Esqueci minha senha ]

[ Entrar ]
```

- Link "Esqueci minha senha" → fluxo de recuperação (seção 2)
- Sem link de cadastro — acesso por convite apenas
- Whitelabel não se aplica aqui — é a tela da plataforma, não da assessoria

---

## 2. Recuperação de Senha

### Passo 1 — Solicitar link

**URL:** `/signin/recuperar` *(Fase 3)*

```
Recuperar senha

Informe o email cadastrado. Você receberá um link para criar uma nova senha.

Email
[_________________________________]

[ Enviar link ]       [ Voltar ao login ]
```

- Ao submeter: exibe mensagem de confirmação **independente de o email existir ou não**
  - Mensagem: *"Se este email estiver cadastrado, você receberá as instruções em instantes."*
  - Motivo: não revelar quais emails estão cadastrados no sistema

---

### Passo 2 — Email recebido

Email enviado via **Resend** contendo:
- Link com token de uso único e expiração de **1 hora** (gerenciado pelo Better Auth)
- Formato: `{NEXT_PUBLIC_BASE_URL}/signin/redefinir?token={token}`

---

### Passo 3 — Redefinir senha

**URL:** `/signin/redefinir?token={token}`

```
Criar nova senha

Nova senha
[_________________________________]

Confirmar nova senha
[_________________________________]

[ Salvar nova senha ]
```

**Validações:**
- Mínimo 8 caracteres
- Confirmação deve ser idêntica à nova senha
- Token inválido ou expirado → mensagem de erro + link para solicitar novo

**Após salvar:**
- Senha atualizada
- Todos os tokens de sessão anteriores invalidados
- Redirecionamento automático para `/signin` com mensagem: *"Senha atualizada. Faça login."*

---

## 3. Cadastro de Assessor (via UI pelo Master)

Não existe fluxo de auto-cadastro. Assessores são criados pelo Master via UI:

- **Batch** no drawer "Criar nova organização" em `/organizacoes` (permite adicionar N assessores de uma vez)
- **Individual** no drawer "Adicionar Assessor" em `/[shortId]/organizacao`

Em ambos os fluxos, a action server chama `auth.api.signUpEmail` do Better Auth e insere linha em `assessor` (tabela de membership com `userId + organizacaoUid + role`).

**Dados necessários para criar uma conta:**

| Campo | Notas |
|---|---|
| Nome completo | Salvo em `user.name` |
| Email | Salvo em `user.email` (único no sistema) |
| Senha inicial | Temporária — assessor deve trocar no primeiro acesso *(Fase 3)* |
| Role na org | `owner` · `admin` · `member` — salvo em `assessor.role` |
| `organizacaoUid` | FK pra tabela `organizacao` |

**Primeiro acesso do assessor (Fase 3):**
- Sistema detecta flag `must_change_password: true` (coluna a adicionar no user)
- Redireciona para tela de redefinição de senha antes de liberar o dashboard
- Fluxo idêntico ao Passo 3 da recuperação

---

## 4. Sessão e Segurança

| Aspecto | Decisão |
|---|---|
| Duração da sessão | Configurável — padrão 8 horas de inatividade |
| Sessão expirada | Redireciona para `/login` com aviso: *"Sua sessão expirou."* |
| Múltiplos dispositivos | Permitido — sem restrição de sessão única |
| Token de recuperação | UUID v4, uso único, expira em 1 hora |
| Brute force | Bloqueio após 5 tentativas incorretas consecutivas — aviso na tela |
