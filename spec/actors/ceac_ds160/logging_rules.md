# Diretrizes de Observabilidade e Logs (Logging Rules)

Este documento especifica a estratégia obrigatória de rastreio de erros e falhas em toda a infraestrutura (validadão no Front-end e Automador). 

Para garantir escalabilidade, o sistema nunca deve tratar todos os erros como uma "falha genérica". Ele deve diagnosticar e categorizar as interrupções de fluxo rigorosamente, isolando defeitos sistêmicos de falhas oriundas das informações submetidas.

## 1. Taxonomia e Segregação de Erros
A aplicação deve obrigatoriamente classificar toda falha da jornada em dois baldes isolados:

### A. Data/Validation Failures (Falhas de Dados)
- **Classificação:** O fluxo esbarrou num impedimento porque as informações fornecidas desrespeitam o Schema ou causaram um "Alert" vermelho no governo após a fase de injeção (ex: *"Data de Início do Visto é anterior a Hoje"*, *"O nome contém números"*).
- **Propósito do Log:** Evidenciar que o bloco de dados é falho. Dispara ações orientadas ao cliente (notificação para que ele corrija o dado inválido no Portal).
- **O que deve ter:** O log deve expor a *Chave Mapeada* que falhou, o *Valor* que tentou penetrar, e a *Mensagem do Governo ou Schema* sobre o motivo da rejeição. 

### B. Engine/Navigation Exceptions (Falhas Sistêmicas)
- **Classificação:** O fluxo esbarrou em impasses de rede, DOM, rotas, de mecânica robótica ou segurança governamental (ex: *Timeouts esperando elemento, queda de proxy, Captcha infinito, "Node Unknown", "Session Expired"*). O dado do usuário não tem correlação estrutural direta com a queda.
- **Propósito do Log:** Disparar alarmes técnicos à equipe/monitoring e, dependendo das chaves, disparar mecanismos automáticos de Retry/Recovery (usando a página `02_recovery`) na própria automação.
- **O que deve ter:** O log deve registrar ONDE na Matriz de Navegação a engine tombou (ex: `Failed at Router 19_Security_Background`), que elemento esperado estava invisível, qual sub-rotina executava (Click, Regex ou Submit) e o Estado da Conexão.

## 2. Granularidade do Momento de Falha (Tracking Snapshot)
- **O que deve ter:** Todo apontamento crítico na automação ou na árvore de preenchimento deve marcar qual foi a última etapa atingida com sucesso absoluto, provendo uma visão de progresso (`pageStats`). Quando um Navigation Error emergir na secção "Family", a equipe saberá categoricamente que a engine sobreviveu à fase "Travel/Passport" intacta.
- **O Objetivo:** Esse formato enxuta horas de depuração e isola rapidamente qual é a nova regra não-mapeada inserida pelo Departamento de Defesa sem precisar inspecionar a rodada completa em Sandbox.

## 3. Taxonomia Detalhada de Causas de Falha

Toda falha capturada deve ser **classificada com uma causa canônica** antes de ser logada. A nova engine deve implementar uma camada de classificação inteligente que resolva a causa com base no estado da página e na mensagem de erro. As causas reconhecidas são:

| Causa Canônica | Tipo (A ou B) | Descrição |
|---|---|---|
| `validation_error` | **A — Dados** | Dado fornecido é inválido ou ausente segundo o Schema ou o governo |
| `missing_data` | **A — Dados** | Campo obrigatório não fornecido no payload |
| `captcha_failed` | **B — Engine** | Serviço de resolução (CapMonster) não conseguiu resolver o desafio |
| `challenge_detected` | **B — Engine** | O CEAC detectou comportamento automatizado e ativou barreira de segurança |
| `timeout` | **B — Engine** | Servidor ou elemento não respondeu dentro do tempo esperado |
| `dom_mismatch` | **B — Engine** | Elemento esperado não encontrado na DOM — estrutura do CEAC pode ter mudado |
| `session_expired` | **B — Engine** | A sessão do governo expirou durante o preenchimento |
| `network_error` | **B — Engine** | Falha de conectividade com os servidores do CEAC |
| `unknown_error` | **B — Engine** | Erro não classificável — requer investigação manual |

## 4. Política de Descarte de Sessão

Determinadas causas de falha tornam a sessão atual **irrecuperável**. Nesses casos, a engine não deve tentar um retry na mesma instância — deve **descartar a sessão por completo** e iniciar uma nova.

**Causas que exigem descarte obrigatório de sessão:**
- `challenge_detected` — O CEAC bloqueou a sessão ativamente; qualquer nova ação será ignorada ou punida com bloqueio adicional.
- `dom_mismatch` — A estrutura da página diverge do mapeamento; continuar pode injetar dados em campos errados.
- `session_expired` — A sessão governamental expirou; não existe recuperação sem reautenticação.

**Causas que permitem retry na mesma sessão:**
- `captcha_failed`, `timeout`, `network_error` — São falhas transitórias que podem ser resolvidas com nova tentativa.

---

## 5. Catálogo Canônico de Causas (Fonte Única de Verdade)

O catálogo abaixo substitui e expande a tabela da §3. Toda implementação de diagnóstico deve derivar deste catálogo, nunca de strings ad-hoc.

### 5.1 Causas de Severidade `system` (Engine/DOM)

| Causa Canônica | autoRetry | Padrão de Detecção | Ação Diagnóstica |
|---|---|---|---|
| `dropdown_changed` | ❌ | `/no option matching/i` | DS-160 mudou opções do dropdown — atualizar field-map |
| `field_missing` | ❌ | `/element not found.*(tbx\|ddl\|rbl)/i` | DS-160 mudou ID do campo — atualizar regex no field-map |
| `select_mismatch` | ❌ | `/field_error:select/i` | Valor do select não encontrado — verificar mapeamento |
| `postback_stuck` | ✅ | `/postback.*(timeout\|stuck)/i` | Novo trigger de postback não mapeado — requer investigação |
| `page_stuck` | ✅ | `/page didn.*advance\|stuck.*same page/i` | Página não avançou — verificar validação via screenshot |
| `null_value` | ❌ | `/null.*value\|undefined.*value\|Cannot read prop/i` | normalizeProfile não trata o campo — falha de dados upstream |
| `unknown_page` | ❌ | `/identifyPage.*unknown\|page.*not recognized/i` | DS-160 adicionou nova página ou mudou layout — requer mapeamento |

> Nota: `postback_stuck` e `page_stuck` têm `autoRetry: true` mas são causas **sistêmicas** — devem gerar alerta técnico mesmo sendo retentadas.

### 5.2 Causas de Severidade `operational` (Transientes)

| Causa Canônica | autoRetry | Padrão de Detecção | Ação Diagnóstica |
|---|---|---|---|
| `captcha_failed` | ✅ | `/captcha.*(failed\|timeout\|balance)/i` | Verificar saldo CapMonster ou configuração do serviço |
| `browser_closed` | ✅ | `/browser.*closed\|target.*closed\|context.*destroyed/i` | Browser crashou — retry automático com nova instância |
| `network_error` | ✅ | `/net::ERR_\|ECONNREFUSED\|timeout.*navigation/i` | Falha de rede — verificar proxy e retry |
| `session_expired` | ✅ | `/session.*(expired\|timeout)\|please start over/i` | Sessão DS-160 expirou — requer novo browser |

### 5.3 Causas de Severidade `data` (Dados do Solicitante)

| Causa Canônica | autoRetry | Padrão de Detecção | Ação Diagnóstica |
|---|---|---|---|
| `validation_error` | ❌ | `/validation.*error\|required.*field\|campo.*obrigat/i` | Campo obrigatório ausente — verificar JSON + normalizeProfile |
| `invalid_field_value` | ❌ | `/is invalid\|cannot be\|not allowed\|invalid.*character/i` | Valor rejeitado pelo DS-160 — corrigir dados do solicitante |
| `missing_data` | ❌ | `/missing.*data\|dados.*faltantes\|campo faltante/i` | Dados incompletos — solicitar preenchimento ao cliente |

---

## 6. Regra de Diagnóstico — Prioridade de Resolução

Ao diagnosticar um erro, aplicar na ordem:

1. **Causa já identificada** pela engine (`errorCause` explícito) → buscar no catálogo pelo campo `cause`
2. **Pattern matching** sobre a mensagem de erro → testar cada regex em ordem do catálogo
3. **Fallback** → causa `unknown`, severidade `unknown`, `autoRetry: false`, gerar alerta para adição ao catálogo

> **Regra:** Causas `unknown` nunca devem silenciar — devem sempre gerar log de alerta para expandir o catálogo.
