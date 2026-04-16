# Ator AIS: Cadastro, Solicitantes e Taxa (MRV)

Este ator é responsável pela entrada inicial no portal AIS, configuração dos perfis de solicitantes e geração dos meios de pagamento.

## URL Base
- [ais.usvisa-info.com](https://ais.usvisa-info.com/)

## Etapas do Processo (Granular)
1. **Cadastro de Conta**: Criação da conta no portal AIS usando identificadores dinâmicos (e-mails via addy.io).
2. **Confirmação por E-mail**: Monitoramento automático e validação da conta recém-criada (link de ativação).
3. **Adição de Solicitantes**: Inserção individual ou grupal dos solicitantes com base no JSON gerado pelo Formulário Clone.
4. **Geração de Taxa (MRV)**: 
    - Seleção do método de pagamento.
    - **Ação 3.1**: Emissão, download e salvamento do boleto da taxa MRV para envio ao cliente/assessor.

## Requisitos Técnicos
- **Input**: JSON estruturado com dados biográficos e de passaporte.
- **Output**: PDF do boleto MRV e IDs de solicitação vinculados à conta.
- **Stack**: Crawlee + Playwright + Capmonster (Captcha de login).
