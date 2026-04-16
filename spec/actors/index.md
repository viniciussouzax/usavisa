# Ecossistema de Atores (Robôs de Automação)

> **Contrato base universal:** Todo actor segue [actor-base.md](./actor-base.md) — stack, modelo de execução, estados, retry, taxonomia de erros e observabilidade. Cada diretório de actor contém apenas o que é específico daquele portal.

Este diretório centraliza a especificação técnica e funcional de todos os Atores (robôs) que compõem o ecossistema **Sends160** no Apify.

## Arquitetura Padrão (Worker Standard)

Todos os atores devem ser desenvolvidos seguindo o boilerplate oficial de **TypeScript + Crawlee + Playwright + Chrome**.

### 1. Stack Técnica Mandatória
- **Linguagem**: TypeScript (ESM).
- **Crawler**: `PlaywrightCrawler` do Crawlee.
- **Browser**: Headless Chrome.
- **Proxy**: Residencial (Configuração obrigatória via `Actor.createProxyConfiguration`).
- **Resolução de Captcha**: Integração com Capmonster.
- **Identidade**: Integração com addy.io para gestão de e-mails.

### 2. Boilerplate de Referência (Entry Point)
```typescript
import { PlaywrightCrawler } from '@crawlee/playwright';
import { Actor } from 'apify';
import { router } from './routes.js'; // Garantir extensão .js em ESM

await Actor.init();

// Configuração Obrigatória de Proxy Residencial
const proxyConfiguration = await Actor.createProxyConfiguration({ 
    checkAccess: true,
    groups: ['RESIDENTIAL'] 
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            args: ['--disable-gpu'],
        },
    },
});

await crawler.run(startUrls);
await Actor.exit();
```

### 3. Esquemas de Dados
Cada ator deve possuir:
- **`input_schema.json`**: Definição rigorosa dos parâmetros de entrada (URL, credenciais, dados do formulário).
- **`output_schema`**: Padronização dos dados persistidos no Dataset do Apify.

---

## Portfólio de Atores

| ID | Ator | Objetivo | URL Alvo |
|:---|:---|:---|:---|
| 1 | [CAEC DS-160](./ceac_ds160/index.md) | Preenchimento e Documentação DS-160 | ceac.state.gov |
| 2 | [AIS Cadastro](./ais_cadastro_taxa/index.md) | Cadastro e Emissão de Boleto (Ação 3.1) | usvisa-info.com |
| 3 | [AIS Monitor](./ais_monitoramento/index.md) | Varredura de Vagas e Datas | usvisa-info.com |
| 4 | [AIS Agendamento](./ais_agendamento/index.md) | Reserva e Comprovantes (Ações 5.1/5.2) | usvisa-info.com |
| 5 | [AIS Antecipação](./ais_antecipacao/index.md) | Estratégia de Antecipação de Datas | usvisa-info.com |
| 6 | [Status Check](./visa_status_check/index.md) | Monitoramento de Progresso Consular | ceac.state.gov |
| 7 | [FOIA Expert](./foia/index.md) | Inteligência Pré-Contencioso | foia.state.gov |
| 8 | [IA Analysis](./ias/analysis/index.md) | Pré-Análise de Triagem | N/A |
| 9 | [IA Doctor](./ias/doctor/index.md) | Diagnóstico de Erros e Logs | N/A |
| 10 | [IA Dev](./ias/dev/index.md) | Manutenção de Código e DOM | N/A |
