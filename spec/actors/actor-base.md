# Actor Base — Contrato Universal

Especificação base que **todos os actors** da plataforma devem seguir, independente do portal ou tarefa. Cada actor específico estende este contrato — nunca o contradiz.

> Regras específicas de um portal (CEAC, AIS, etc.) ficam no diretório do actor. Regras aqui são universais.

---

## 1. Stack Mandatória

```
Linguagem:   TypeScript (ESM)
Crawler:     PlaywrightCrawler (Crawlee)
Browser:     Headless Chrome
Proxy:       Residencial obrigatório (Actor.createProxyConfiguration)
Plataforma:  Apify
```

Qualquer desvio desta stack requer decisão explícita documentada no `index.md` do actor.

---

## 2. Modelo de Execução

**Demanda-driven. Stateless. Um actor por tarefa.**

```
Evento externo dispara o actor
  → Actor sobe (boot)
  → Processa UMA tarefa
  → Encerra (exit)
```

- Sem polling loop — o actor não fica rodando esperando trabalho
- Sem estado interno entre execuções — tudo vem do banco ou do input
- Paralelismo gerenciado pela Apify — múltiplos runs simultâneos são normais
- Quem decide quando disparar é o orquestrador (Supabase Webhook / pg_cron / dashboard)

---

## 3. Gatilho e Input

O actor recebe contexto via **input do Actor Run** — nunca via variáveis de ambiente de fila:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `taskId` | uuid | ✅ | ID da tarefa/registro a processar |
| `orgId` | uuid | ✅ | ID da organização |
| `mode` | string | — | `'real'` (default) ou `'dry_run'` (simula sem submeter) |

Cada actor pode estender com campos adicionais no próprio `input_schema.json`.

---

## 4. Proxy — Obrigatoriedade

**Proxy residencial é obrigatório.** Execução sem proxy válido falha imediatamente com erro fatal — nunca tenta sem proxy.

- Session ID por tarefa para garantir stickiness de IP durante toda a execução
- Padrão do session ID: `{actor_id}_{taskId_sanitizado}_{timestamp}`
- Configuração lida da tabela `settings` no banco — nunca hardcoded

---

## 5. Claim Atômico — Prevenção de Race Condition

Antes de processar, o actor deve **claimar** a tarefa via UPDATE condicional atômico:

```sql
UPDATE tasks
SET status = 'doing', worker_id = :worker, started_at = NOW()
WHERE id = :task_id
  AND status IN ('todo', 'retry')
RETURNING id
```

- Retornou **0 linhas** → outro worker já está processando → encerrar sem erro
- Retornou **1 linha** → claim bem-sucedido → prosseguir
- **Nunca usar SELECT antes do UPDATE** — a janela entre as duas operações cria race condition

Para actors com RLS no Supabase: usar RPC `SECURITY DEFINER` para garantir atomicidade.

---

## 6. Máquina de Estados Universal

Toda tarefa percorre os seguintes estados:

```
todo ──→ doing ──→ done
                ↘ error      dados inválidos — aguarda correção do assessor
                ↘ standby    problema do portal/rede — auto-retry após cooldown
                ↘ fail       falha sistêmica — requer liberação manual (dev)
                ↘ retry      re-enfileirado após esgotar tentativas automáticas
```

| Status | Quem seta | Próximo passo |
|---|---|---|
| `todo` | Sistema / reset | Disponível para claim |
| `doing` | Actor (claim) | Processando |
| `done` | Actor | Fim — sucesso |
| `error` | Actor | Assessor corrige dado → volta para `todo` |
| `standby` | Actor | Auto-retry após 30 minutos |
| `fail` | Actor | Bloqueado até liberação manual por dev |
| `retry` | Actor | Re-enfileirado com contagem de tentativas zerada |

> `fail` é o único status que requer intervenção humana (dev/admin) para ser liberado.

---

## 7. Definition of Ready (DoR) — Portão de Entrada

Antes de abrir o browser, validar os dados mínimos obrigatórios para a tarefa.

**Se qualquer campo obrigatório estiver ausente:**
- Marcar status `error` imediatamente
- Gravar qual campo está faltando no log
- Encerrar sem abrir browser

Cada actor define sua própria lista de campos obrigatórios no `index.md`.

---

## 8. Definition of Done (DoD) — Portão de Saída

Uma tarefa só é `done` quando há **confirmação verificável** de conclusão — não apenas ausência de erro.

Exemplos por actor:
- DS-160: `applicationId` (código AA...) capturado e persistido
- Status Check: resultado de status lido e gravado
- Agendamento: número de confirmação capturado

Sem confirmação verificável → marcar `done` mas gerar alerta de auditoria.

---

## 9. Política de Retry

### Máximo de tentativas
- **3 tentativas** por tarefa antes de escalar para `standby` ou `fail`

### Backoff entre tentativas
| Tentativa | Delay |
|---|---|
| 1ª | 2 minutos |
| 2ª | 4 minutos |
| 3ª | 6 minutos |

### Erros de dado — sem retry
Causas do tipo **Data** (ver seção 11) encerram imediatamente com `error` — dados errados não se resolvem com retry.

### Pausa global por erros consecutivos
Após **3 erros consecutivos** em qualquer tarefa, o worker pausa **15 minutos** antes de tentar a próxima. O contador zera após qualquer sucesso.

### Standby cooldown
Tarefas em `standby` só são claimáveis após **30 minutos** da última atualização.

### Stale detection
Se `status = 'doing'` há mais de **10 minutos**, o registro é considerado stale (worker crashou). Reset automático para `todo`.

---

## 10. Graceful Shutdown (SIGTERM)

Ao receber sinal de encerramento (timeout da plataforma, SIGTERM):

1. Resetar o status da tarefa para o valor anterior ao claim
2. Limpar `worker_id` e `started_at`
3. A tarefa fica disponível para o próximo run

Reset condicional — só resetar se o status ainda for `doing`. Evita sobrescrever um `done` ou `error` já gravado pelo próprio actor.

---

## 11. Taxonomia de Erros — Dois Tipos

### Tipo A — Erro de Dado
O portal rejeitou ou não conseguiu processar porque **os dados do solicitante são inválidos**.

- **Ação:** parar imediatamente, marcar `error`, gravar qual campo e qual valor causou a rejeição
- **Quem resolve:** assessor corrige o dado no dashboard e reautoriza
- **Retry automático:** ❌ — dados errados não se resolvem sozinhos

### Tipo B — Erro de Engine / Portal
O actor encontrou um **obstáculo técnico** — rede, CAPTCHA, DOM mudou, sessão expirou.

- **Ação:** tentar resolver automaticamente (retry, nova sessão, aguardar)
- **Quem resolve:** o próprio actor (automático) ou dev se esgotar todas as tentativas
- **Assessor acionado:** ❌ — problema técnico, não de dado

---

## 12. Causas Canônicas de Erro

Toda falha deve ser classificada com uma causa canônica antes de ser logada. Nunca usar strings ad-hoc.

### Tipo A — Dados
| Causa | autoRetry | Descrição |
|---|---|---|
| `missing_data` | ❌ | Campo obrigatório ausente no payload |
| `validation_error` | ❌ | Dado inválido segundo o schema ou rejeitado pelo portal |
| `invalid_field_value` | ❌ | Valor não aceito pelo portal para aquele campo |
| `select_mismatch` | ❌ | Valor do select não encontrado nas opções disponíveis |

### Tipo B — Engine
| Causa | autoRetry | Descrição |
|---|---|---|
| `timeout` | ✅ | Elemento ou servidor não respondeu no tempo limite |
| `network_error` | ✅ | Falha de conectividade |
| `session_expired` | ✅ | Sessão expirou — requer nova instância |
| `captcha_failed` | ✅ | Serviço de resolução não conseguiu resolver |
| `challenge_detected` | ❌ | Portal detectou automação — sessão comprometida |
| `dom_mismatch` | ❌ | Elemento esperado não encontrado — portal pode ter mudado |
| `browser_closed` | ✅ | Browser crashou — retry com nova instância |
| `unknown_error` | ❌ | Não classificável — gerar alerta, nunca silenciar |

> Causas `unknown_error` nunca devem ser ignoradas — sempre geram alerta para expansão do catálogo.

### Prioridade de classificação
1. Causa já identificada explicitamente pelo actor
2. Pattern matching sobre a mensagem de erro
3. Fallback: `unknown_error` + alerta

---

## 13. Política de Descarte de Sessão

Certas causas tornam a sessão atual irrecuperável — o actor não tenta retry na mesma instância:

| Causa | Motivo do descarte |
|---|---|
| `challenge_detected` | Portal bloqueou a sessão ativamente |
| `dom_mismatch` | Estrutura diverge — continuar pode injetar dados errados |
| `session_expired` | Sessão governamental expirada — sem recuperação |

Causas que permitem retry na mesma sessão: `captcha_failed`, `timeout`, `network_error`.

---

## 14. Observabilidade — Tabelas Obrigatórias

Todo actor deve gravar em:

### `actor_logs` (execução por tarefa)
| Campo | Tipo | Descrição |
|---|---|---|
| `actor_id` | string | Identificador do actor (ex: `ceac_ds160`) |
| `task_id` | uuid | ID da tarefa processada |
| `org_id` | uuid | ID da organização |
| `status` | string | Status final: `done`, `error`, `standby`, `fail` |
| `error_cause` | string | Causa canônica (se houve erro) |
| `error_message` | string | Mensagem detalhada |
| `step` | string | Última etapa concluída com sucesso |
| `retry_number` | int | Número da tentativa (0 = primeira) |
| `duration_ms` | int | Duração total da execução |
| `screenshot_url` | string | URL do screenshot no momento do erro |
| `worker_id` | string | ID do Apify Actor Run |
| `created_at` | timestamp | — |

### `actor_steps` (progresso por etapa — opcional mas recomendado)
| Campo | Tipo | Descrição |
|---|---|---|
| `log_id` | uuid | FK para `actor_logs` |
| `step` | string | Nome da etapa |
| `status` | string | `ok` / `error` |
| `duration_ms` | int | Duração da etapa |
| `detail` | jsonb | Contexto adicional da etapa |

---

## 15. Modo Dry Run

Todo actor deve suportar `mode: 'dry_run'`:
- Executa todas as etapas normalmente
- **Não submete** o formulário / não confirma o agendamento / não efetua pagamento
- Grava no log com flag `dry_run: true`
- Útil para validar dados antes de executar em produção

---

## 16. Lógica de Grupo (quando aplicável)

Actors que processam membros de um grupo devem verificar, após concluir com sucesso:

1. Marcar o membro individual como `done`
2. Verificar se todos os membros ativos do grupo estão `done`
3. Se todos done → avançar o grupo para o próximo estágio
4. Se não → aguardar, sem alterar os demais

Membros com status `archived` são excluídos da verificação de completude.

---

## 17. Referência por Actor

| Actor | Diretório | Estende este contrato? |
|---|---|---|
| CEAC DS-160 | `ceac_ds160/` | ✅ + `worker_rules.md`, `logging_rules.md` |
| AIS Cadastro Taxa | `ais_cadastro_taxa/` | ✅ |
| AIS Monitoramento | `ais_monitoramento/` | ✅ |
| AIS Agendamento | `ais_agendamento/` | ✅ |
| AIS Antecipação | `ais_antecipacao/` | ✅ |
| Visa Status Check | `visa_status_check/` | ✅ |
