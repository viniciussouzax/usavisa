# Especificação Arquitetural do DS-160 (CEAC)

Este diretório contém o **Santo Graal** da engenharia reversa do formulário DS-160 (Consular Electronic Application Center). A documentação aqui presente não trata apenas do sistema local, mas documenta os *fatos imutáveis* e o comportamento da plataforma do Governo Americano.

Esta especificação foi criada para ser a **"Single Source of Truth" (Fonte Única da Verdade)** para qualquer desenvolvedor que venha a trabalhar na construção do motor de automação (Filler), do Front-End (UI) ou do Banco de Dados.

---

## 1. Regras do Motor e Infraestrutura (Engine & Worker)
Estes documentos definem *como* o robô de automação roda na nuvem, como interage com a rede e como orquestra as filas de atendimento.

- **[worker_rules.md](./worker_rules.md)** — Arquitetura *Receptiva/Stateless*. Define como o robô (ex: Apify Actor) é acionado por demanda, como executa o *Atomic Claim* no PostgreSQL e lida com os status da aplicação (`todo`, `doing`, `standby`).
- **[logging_rules.md](./logging_rules.md)** — Taxonomia restrita de falhas. Define os 14 erros mapeados do CEAC (`session_timeout`, `blocked_ip`, `fatal_ui_error`, etc.) e a diferença entre Falhas de Domínio (Dados do Cliente) e Incidentes do Sistema (Bloqueios).
- **[engine_rules.md](./engine_rules.md)** — O coração do *Playwright Pattern*. O fluxo das 4 Fases (Resolve Target, Mutate DOM, Network Flush, Wait Navigation). Proíbe ações assíncronas soltas e `Sleeps` mágicos.

---

## 2. Mapa do Formulário e Comportamento da UI (CEAC DOM Facts)
Estes documentos representam as regras geográficas e estruturais da interface web ASP.NET do governo americano.

- **[form_bifurcations.md](./form_bifurcations.md)** — Matriz das 64 lógicas condicionais que revelam campos ocultos e inventário das 19 listas dinâmicas (`DataLists` / AddAnother).
- **[postback_triggers.md](./postback_triggers.md)** — Inventário dos IDs de rádio e selects canônicos que disparam requisições síncronas ao servidor (`WebForm_DoPostBackWithOptions`), exigindo sincronismo estrito na delegação de injeção de dados.
- **[captcha_rules.md](./captcha_rules.md)** — Dissecação total dos 3 portões de CAPTCHA do sistema (Gate A: BotDetect / Gate B: Shape Security TSPD / Gate C: hCaptcha) e as janelas de respiro lógico para solvers externos.
- **[navigation_rules.md](./navigation_rules.md)** — Regras globais de Roteamento (*Skip/Bypass*). Documenta os macro-saltos de navegação (ex: menores de 14 anos pulam histórico profissional, dependentes F2 pulam contatos de estudantes, etc).

---

## 3. Dados e Compilação (Schema & DTOs)
- **[schema_rules.md](./schema_rules.md)** — Arquitetura de modulação (PAGE_ORDER), lógica estrita de serialização, conversores para ASCII e tratamentos para sentinelas (Botões `Does Not Apply` / `Do Not Know`).

---

## 4. O Formulário (Módulos Individuais)
A pasta `pages/` reflete exatamente as 28 fases reais do percurso do DS-160 dentro do CEAC, de ponta a ponta. A regra de ouro dita que **"Nenhuma regra específica de preenchimento reside nos arquivos de arquitetura global. Cada variável tem sua casa isolada nos módulos"**.

**Pre-Workflow:**
1. [Landing / Apply](./pages/01_apply.md)
2. [Recovery](./pages/02_recovery.md)
3. [Security Question Setup](./pages/03_security_question.md)

**Main Workflow:**
4. [Personal 1](./pages/04_personal1.md)
5. [Personal 2](./pages/05_personal2.md)
6. [Travel](./pages/06_travel.md)
7. [Travel Companions](./pages/07_travel_companions.md)
8. [Previous US Travel](./pages/08_previous_us_travel.md)
9. [Address & Phone](./pages/09_address_and_phone.md)
10. [Passport](./pages/10_passport.md)
11. [US Contact](./pages/11_us_contact.md)
12. [Family 1 (Parents & Relatives)](./pages/12_family1.md)
13. [Family 2 (Spouse/Partner)](./pages/13_family2_spouse.md) - *Condicional*
14. [Deceased Spouse](./pages/14_deceased_spouse.md) - *Condicional*
15. [Previous Spouse](./pages/15_previous_spouse.md) - *Condicional*
16. [Work/Education 1 (Current)](./pages/16_work_education1.md)
17. [Work/Education 2 (Previous)](./pages/17_work_education2.md)
18. [Work/Education 3 (Additional)](./pages/18_work_education3.md)
19. [Security & Background](./pages/19_security_and_background.md)

**Visa Specifics (Condicionais):**
20. [Student/Exchange SEVIS](./pages/20_student_exchange_sevis.md)
21. [Student Add Contact](./pages/21_student_add_contact.md)
22. [Temporary Work](./pages/22_temporary_work.md)

**Media & Submission:**
23. [Photo Upload](./pages/23_photo.md)
24. [Review](./pages/24_review.md)
25. [Sign and Submit](./pages/25_sign_and_submit.md)
26. [Application Dashboard](./pages/26_application_dashboard.md)
27. [Print Application](./pages/27_print_application.md)
28. [Print Confirmation](./pages/28_print_confirmation.md)
