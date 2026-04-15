# Arquitetura Frontend: Hierarquia e Modulação

O frontend do ecossistema Sends160 é estruturado em blocos isolados (Módulos), onde cada componente tem uma responsabilidade única e bem definida. Todos os documentos abaixo são de nível Granular e Cristalino.

> **Terminologia:** O spec usa `caso` em vários lugares. O código e as URLs usam `solicitação` — são equivalentes. Ver [decisions_log.md](./decisions_log.md) para outras decisões tomadas.
>
> **Estado atual da implementação:** ver [status.md](./status.md).

## ⚙️ Fundação Global (Nível 0)

### [Core: Infraestrutura e Shell](./app-core.md)
*O app-core vive solto na raiz do frontend justamente por não ser um módulo de negócio isolado, mas sim a fundação tecnológica que envelopa toda e qualquer página do frontend.*
- **Responsabilidade**: API Serverless (Supabase), Autenticação/Sessão, Roteamento global e Interface base (Loading, Toast).

---

## 🏗️ Gestão e Operação (Hierarquia Aninhada)

### 1. [Dashboard Central](./dashboard/index.md)
*O painel único de gestão. Abas e permissões (Assessor vs. Master/Admin) são definidas por `roles` neste mesmo hub central, sem necessidade de separar os sistemas.*
- **Foco**: Lista mestre de pedidos (grupos) e sub-painéis operacionais.
- **Responsabilidade**: Visão consolidada de solicitações ativas e gestão de portal (conforme o nível de acesso).

    ### 1.1 [Detalhe do Caso](./dashboard/case-detail/index.md)
    *Estando aninhado no dashboard, este módulo representa a visualização interna de uma solicitação escolhida.*
    - **Foco**: A família/grupo. Em quem a assessoria clicou.
    - **Responsabilidade**: Compartilhamento de dados do grupo.

        ### 1.1.1 [Formulário (Core Consular)](./formulario/index.md)
        *Nota: O formulário é um módulo isolado porque ele é reaproveitado se o próprio candidato final (fora da assessoria) preencher.*
        - **Foco**: Edição unitária dos dados de uma pessoa. O Espelho Consular.
        - **Mapeamento Extra**: [Dicionário de IDs (Schema Reference)](./formulario/schema-ref.md).

---

## 🌐 Módulos Extras e Apoio B2B

1.  **Landing Page institucional** — `/` existe como placeholder simples. Redesign B2B é observação futura, não no MVP.
2.  **Documentação Técnica** — repositório futuro de tutoriais, manuais e guias (fora do escopo atual).
