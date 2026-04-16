# Ator AIS: Agendamento e Documentação

O ator de agendamento é o responsável pela execução logística final, reservando os slots no CASV e Consulado e colhendo as provas de agendamento.

## URL Base
- [ais.usvisa-info.com](https://ais.usvisa-info.com/)

## Etapas do Processo (Granular)
4. **Confirmação de Pagamento**: Verificação automática da compensação da taxa MRV (check via e-mail ou portal).
5. **Agendamento CASV & Entrevista**: Escolha de datas conforme a estratégia (datas mais próximas disponíveis).
6. **Logística de Documentos**: 
    - **Ação 5.1**: Download do comprovante de pagamento (MRV Receipt).
    - **Ação 5.2**: Download da confirmação de agendamento (Appointment Confirmation).
    - Definição da forma de entrega do passaporte.

## Requisitos Técnicos
- **Input**: Credenciais de conta (addy.io) e preferências de datas/locais.
- **Output**: PDFs de confirmação de agendamento e pagamento.
- **Stack**: Crawlee + Playwright + Capmonster.
