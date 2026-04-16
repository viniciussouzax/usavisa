# 27. Print Confirmation (Confirmação Oficial)

**URLs Típicas:** 
- `https://ceac.state.gov/GenNIV/General/ESign/Print_Confirmation.aspx` (Ou equivalente via popup window.print)
**Título CEAC:** Confirmation Form

---

## 1. Visão Geral da Entidade 

Esta tela é gerada ao engatilhar a ação `Print Confirmation` (a partir da Página 25). É o PDF estritamente obrigatório que deve ser levado pelo aplicante na triagem física (presencial) no dia do consulado.

**Componentes Visuais Indispensáveis:**
- **Confirmation Number:** O ID absoluto do processo gerado (`AA00FE8UK3`).
- **Código de Barras Matricial:** Imagem explícita a ser submetida no leitor de laser na Embaixada. (A engine deve assegurar que a renderização do PDF aguarde o loading completo na tag da imagem `<img id="Barcode"...>`). Se a imagem do Barcode falhar e o canvas ficar branco, a submissão física será rejeitada.

## 2. Ação de Captura (File Generation)

**O que o motor deve fazer:**
Assim que a DOM reportar carregamento absoluto (Network Idle) para resolver a chamada de imagem ASPX:
- Injetar CDP e simular a emissão "Salvar como PDF". 
- Nomear como `[APP_ID]_Confirmation.pdf`.

## 3. Encerramento Total Sistêmico

Com ambos os PDFs em mãos (A Application da Página 26 e a Confirmation Atual), atingimos o fim lógico absoluto da vida da Engine para esse Workload específico.

A rotina de automação deve realizar os procedimentos finais (`cleanup` e `callback`):

1. **Associação Cloud:** Subir os dois PDFs binários à infraestrutura de Storage (S3, etc) e parear as URIs no banco de dados, marcando o ID como `COMPLETED / SUBMITTED`.
2. **Scraping Nuclear:** Fechar todas as guias do navegador headless/Proxy e desalocar memória RAM (Destruir a instância para não re-vazar sessions).
3. **Webhook/Gatilhos:** Acionar serviços assíncronos B2B ou CRMs que instruirão as notificações de e-mail ao Requerente com os anexos.

---
**Fim Absoluto da Vida da Sessão DS-160**
