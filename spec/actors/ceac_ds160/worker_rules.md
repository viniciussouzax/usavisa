# Regras do Worker (Orquestração e Ciclo de Vida)

> **Natureza deste documento:** Registra os contratos e invariantes arquiteturais do worker que executa o DS-160. Não contém fatos do CEAC — contém fatos do sistema de orquestração.

---

## 1. Modelo de Execução — Apify Actor

> **Plataforma de execução:** O sistema roda como **Apify Actor**. Cada Actor Run corresponde a exatamente uma execução de automação.

O worker recebe seu contexto de execução via **input do Actor Run** (não via env vars de fila):

| Campo de Input | Tipo | Descrição |
|---|---|---|
| `applicantId` | string (uuid) | ID do applicant a ser processado (obrigatório) |
| `applicationId` | string (uuid) | ID da application (opcional — pode ser buscado pelo engine) |
| `captchaMode` | string | `'capmonster'` ou `'ai_vision'` (default: `'capmonster'`) |

**Paralelismo:** gerenciado pela Apify — múltiplos Actor Runs rodando simultaneamente. O claim atômico via RPC (§14) previne que dois runs processem o mesmo applicant.

> **Sem polling loop.** Cada run: boot → processa 1 applicant → encerra. A lógica de quando disparar o próximo run é responsabilidade da camada de orquestração (webhook/dashboard), não do Actor.

---

## 2. Contrato de Status dos Applicants

Os status válidos do applicant e da execution transitam conforme regras canônicas extraídas de `status-contract.js`:

- `APPLICANT_ACTIVE_STATUS`: `'doing'`
- `APPLICANT_IMMEDIATE_DISPATCH_STATUSES`: `['todo', 'retry']` (podem gerar dispatch imediato)
- `APPLICANT_CLAIMABLE_STATUSES`: `['todo', 'retry', 'standby']` (todos que podem ser processados)
- `APPLICANT_BLOCKING_STATUSES`: `['error', 'fail', 'done']` (estados finais/bloqueantes)
- `STANDBY_COOLDOWN_SECONDS`: `1800` (30 minutos base)

> **Regra do Standby:** O status `standby` **não é claimable incondicionalmente**. A validação via `isStandbyEligible(updatedAt)` avalia o timestamp do banco. A camada externa (orquestrador) obedece isso antes de tentar iniciar o worker para esse applicant.

---

## 3. Claim Atômico (Prevenção de Condição de Corrida)

O claim de um applicant deve ser feito via **UPDATE condicional** — não via SELECT + UPDATE separados:

```sql
UPDATE applicants
SET status = ACTIVE, updated_at = NOW()
WHERE id = :id
  AND status IN (:claimable_statuses)
RETURNING id
```

- Se retornar **0 linhas** → outro worker já fez o claim → sair imediatamente sem erro.
- Se retornar **1 linha** → claim bem-sucedido → prosseguir.

**Nunca usar SELECT para verificar disponibilidade antes do UPDATE** — a janela entre as duas operações cria race condition.

---

## 4. Graceful Shutdown (SIGTERM / SIGINT)

Quando o Actor Run receber sinal de encerramento (SIGTERM / timeout da plataforma), deve:

1. **Resetar `applicants.status`** para o valor anterior ao claim (salvo antes do UPDATE de claim).
2. **Resetar `applications.fill_status = 'todo'`** e `fill_worker_id = null` para a application em andamento.
3. O applicant e a application ficam disponíveis para o próximo Actor Run que for disparado pela orquestração.

**Condição do reset:** Usar UPDATE condicional — só resetar se o status atual ainda for `APPLICANT_ACTIVE_STATUS`. Evita sobrescrever um status já atualizado pelo próprio engine (ex: `'done'` ou `'fail'`).

---

## 5. Proxy — Obrigatoriedade e Configuração

**O proxy é obrigatório para execução do DS-160.** Qualquer execução sem proxy válido deve falhar com erro fatal imediato — não tentar sem proxy.

### Fonte de Configuração
Toda a configuração de proxy vem da tabela `settings` (chaves `key_name` / `key_value`). As chaves relevantes são:

| key_name | Descrição |
|---|---|
| `proxy_provider` | Provedor ativo (`dataimpulse` ou `apify`) |
| `proxy_url` | URL do proxy — formato `http://user:pass@host:port` |
| `proxy_countries` | Lista de países permitidos (ex: `"us,br"`) |
| `apify_proxy_password` | Credencial Apify |
| `apify_proxy_username` | Username Apify |
| `apify_proxy_username_mode` | Modo de geração do username Apify |
| `apify_proxy_groups` | Grupos Apify |
| `apify_proxy_country` | País específico Apify |

### Session ID de Proxy
Cada execução de applicant usa um session ID de proxy para garantir stickiness de IP durante toda a sessão DS-160:

**Padrão:** `app_{applicantId sanitizado}_{timestamp}`

O session ID é gravado na tabela `applications.proxy_session` após o claim, e reutilizado se já existir.

---

## 6. Tabelas de Banco de Dados Envolvidas

| Tabela | Campos Relevantes | Uso |
|---|---|---|
| `applicants` | `id, full_name, status, stage, sort_order, updated_at` | Fila de trabalho |
| `applications` | `id, applicant_id, fill_status, fill_worker_id, proxy_session, proxy_session_created_at` | Estado da execução DS-160 |
| `settings` | `key_name, key_value` | Toda configuração de proxy e comportamento |

---

## 7. Política de Falha Fatal

Falhas que devem encerrar o worker com `process.exit(1)` e registrar via `markFatalFailure`:

- Applicant não encontrado no banco após o claim
- Falha ao claimar a `application` correspondente
- Nenhuma configuração de proxy válida encontrada
- Exceção não capturada no runner principal

Em todos os casos: registrar a causa na tabela `applications` via `_markSystemError` antes de sair.

---

## 8. ⚠️ Modelo de Execução: Demanda vs. Fila

### 8.1 Modelo do Sistema Novo — Demanda-Driven
> **Esta seção define o contrato do novo sistema. O modelo de fila (polling loop) descrito no §§ anteriores é um padrão LEGADO e NÃO deve ser replicado.**

O novo sistema opera em modo **demanda-driven**:
- A automação é **disparada sob demanda**, não por polling de fila
- Cada execução é iniciada por um evento externo (webhook, ação do dashboard, trigger de sistema)
- O worker sobe, processa UM applicant, e encerra — sem loop contínuo

A lógica de **fila e retry** existe, mas é restrita a casos de recuperação de erros e falhas — não é o modelo principal de operação. Este diferencial de funcionamento deve ser planejado e documentado separadamente antes de implementação.

---

## 9. Máquina de Estados — `fill_status` da Application

O estado de preenchimento de cada `application` percorre os seguintes estados:

```
todo → doing → done
              ↘ error      (dado inválido — aguarda correção do usuário)
              ↘ standby    (problema do site — auto-retry após cooldown)
              ↘ fail       (falha sistêmica — requer liberação manual por dev)
              ↘ retry      (re-enfileirado após max retries esgotados)
```

| fill_status | Descrição | Quem reseta |
|---|---|---|
| `todo` | Disponível para claim | Sistema / reset manual |
| `doing` | Sendo processado por um worker | Worker (claim) |
| `done` | Concluído com sucesso | Worker (markDone) |
| `error` | Erro de dados — aguarda usuário corrigir | Worker / Dashboard |
| `standby` | Problema do site — auto-retry após 30min | Worker (markStandby) |
| `fail` | Falha sistêmica — bloqueado até liberação manual | Dev |
| `retry` | Re-enfileirado após esgotar tentativas | Worker (reQueue) |

> **Regra:** O status `fail` é o único que requer intervenção humana (dev/admin) para ser liberado. Todos os outros podem ser tratados automaticamente.

---

## 10. Política de Retry — Mapeamento Causa → Ação

### 10.1 Máximo de Tentativas
- **MAX_RETRIES:** 3 tentativas por applicant/execution

### 10.2 Backoff entre Tentativas
| Tentativa | Delay de espera |
|---|---|
| 1ª | 2 minutos |
| 2ª | 4 minutos |
| 3ª | 6 minutos |
| Além do máximo | 8 minutos (não ocorre — esgota antes) |

**Exceção CAPTCHA:** se a causa for `captcha_failed`, o delay de retry é de **5 segundos** (não backoff) — é uma falha transitória rápida.

### 10.3 Erro de Dados → Parar imediatamente
Causas que encerram o ciclo **sem retry** e marcam `fill_status: 'error'`:
- `missing_data`, `validation_error`, `select_mismatch`, `invalid_field_value`
- Qualquer resultado com `validationErrors.length > 0`

> Dados errados não se resolvem com retry — o usuário precisa corrigir.

### 10.4 Erro Fatal → `fail` imediato
Causa que encerra sem retry e marca `fill_status: 'fail'`:
- `browser_closed`

### 10.5 Max Retries Esgotados — Bifurcação por Causa
Após esgotar MAX_RETRIES:

**→ `standby`** (problema do site, auto-retry após 30min):
`timeout`, `network_error`, `page_stuck`, `postback_stuck`, `captcha_failed`, `session_expired`, `challenge_detected`, `landing_dom_mismatch`, `recovery_dom_mismatch`

**→ `retry`** (re-enfileira com contagem zerada):
Qualquer outra causa não listada acima

### 10.6 Pausa Global (Consecutive Errors)
Após **3 erros consecutivos** em qualquer applicant, o worker entra em pausa de **15 minutos** antes de tentar o próximo. O contador zera após qualquer sucesso.

### 10.7 Stale Detection
Se `fill_status = 'doing'` e `fill_started_at` há mais de **10 minutos**, o registro é considerado stale (worker crashou). Reset automático: `fill_status = 'todo'`, `fill_worker_id = null`, `applicants.status = 'todo'`.

### 10.8 Standby Cooldown
Applicants com `status = 'standby'` só são claimáveis após **30 minutos** da última atualização (`updated_at`).

---

## 11. DoR — Definition of Ready (Portão de Entrada)

Antes de iniciar qualquer automação, validar os campos mínimos obrigatórios. Se qualquer campo estiver ausente, marcar `fill_status: 'error'` e `applicants.status: 'error'` imediatamente — sem abrir browser.

**Campos mínimos obrigatórios (11 campos):**

| Grupo | Campo | Chave no payload |
|---|---|---|
| Location | Local da entrevista | `data.location.location` |
| Personal 1 | Sobrenome | `data.personal1.surname` |
| Personal 1 | Nome | `data.personal1.givenName` |
| Personal 1 | Nome completo nativo | `data.personal1.fullNameNative` |
| Personal 1 | Já usou outros nomes? | `data.personal1.otherNamesUsed` |
| Personal 1 | Possui telecode? | `data.personal1.telecode` |
| Personal 1 | Sexo | `data.personal1.sex` |
| Personal 1 | Estado civil | `data.personal1.maritalStatus` |
| Personal 1 | Data de nascimento | `data.personal1.dob` |
| Personal 1 | Cidade de nascimento | `data.personal1.cityOfBirth` |
| Personal 1 | Estado de nascimento | `data.personal1.stateOfBirth` |
| Personal 1 | País de nascimento | `data.personal1.countryOfBirth` |

---

## 12. DoD — Definition of Done (Portão de Saída)

Uma execução só é considerada **verdadeiramente concluída** se o `applicationId` (código AA... do DS-160) foi capturado e persistido. Sem o `applicationId`, o processo pode ter terminado com sucesso técnico mas sem confirmação de registro governamental.

> Executar sem capturar `applicationId` → marcar como `done` mas gerar alerta de auditoria.

---

## 13. Lógica de Grupo

Quando um applicant que pertence a um `group_id` conclui com sucesso:

1. Marcar o applicant individual como `status: 'done'`
2. Verificar se **todos** os membros do grupo no `stage: 'ds160'` estão com `status: 'done'`
3. **Se todos done** → avançar o grupo inteiro: `stage: 'payment'`, `status: 'todo'`
4. **Se nem todos done** → aguardar, sem alterar os demais membros

> Membros com `stage = 'archived'` são excluídos da verificação de completude do grupo.

---

## 14. Claim via RPC (Segurança)

O claim de uma application deve ser feito via **RPC `claim_application`** (SECURITY DEFINER), não via UPDATE direto. Isso contorna o RLS do Supabase e garante atomicidade sem race condition.

```sql
-- Equivalente lógico do RPC (não usar diretamente — usar RPC)
UPDATE applications
SET fill_status = 'doing', fill_worker_id = :worker, fill_started_at = NOW()
WHERE id = :app_id AND fill_status = 'todo'
RETURNING *
```

---

## 15. Tabelas de Observabilidade

### `error_logs`
| Campo | Tipo | Descrição |
|---|---|---|
| `worker_id` | string | ID único do worker |
| `application_id` | uuid | ID da application |
| `applicant_name` | string | Nome do solicitante |
| `error_message` | string | Mensagem do erro |
| `error_stack` | string | Stack trace + meta JSON |
| `page_name` | string | Página onde ocorreu |
| `retry_number` | int | Número da tentativa |
| `software_version` | string | Versão do engine |
| `field_name` | string | Campo envolvido (se aplicável) |
| `error_cause` | string | Causa canônica (ver logging_rules.md) |
| `screenshot_url` | string | URL do screenshot do erro |
| `video_url` | string | URL do vídeo da sessão |
| `validation_errors` | array | Lista de erros de validação |
| `user_id` | uuid | ID do usuário |
| `company_id` | uuid | ID da empresa |
| `page_html` | string | HTML da página no momento do erro |

### `fill_logs`
| Campo | Tipo | Descrição |
|---|---|---|
| `application_id` | uuid | ID da application |
| `applicant_id` | uuid | ID do solicitante |
| `page_name` | string | Nome da página preenchida |
| `fields_filled` | int | Campos preenchidos com sucesso |
| `fields_total` | int | Total de campos na página |
| `fields_unmatched` | array | Campos sem correspondência no schema |
| `validation_errors` | array | Erros de validação encontrados |
| `navigated` | bool | Se navegou com sucesso para próxima página |
| `attempts` | int | Número de passes/tentativas na página |
| `duration_ms` | int | Duração em milissegundos |
| `worker_id` | string | ID do worker |

---

## 16. Filtro por `execution_mode`

Somente applicants de empresas com `companies.execution_mode = 'server'` devem ser processados pelo worker automatizado. Empresas em modo `'client'` são excluídas da fila — sua automação roda localmente no cliente.

