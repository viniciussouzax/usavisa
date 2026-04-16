# 25. Confirmation and Download

**URLs Típicas:** 
- `https://ceac.state.gov/GenNIV/General/ESign/Complete_Done_Confirmation.aspx?node=Done`
- `.../Page Thank you` (Telas de finalização da API/PDF)
**Título CEAC:** Confirmation / Application Dashboard

---

## 1. Visão Geral da Entidade 

Esta tela não coleta novos dados; ela formaliza o vínculo legal gerando as representações finais do DS-160. É a "linha de chegada" da automação. 

**Componentes Visuais Críticos a Capturar:**
- **Confirmation Number:** (Ex: `AA00FE8UK3`). O ID absoluto do processo gerado. (ID: `ctl00_SiteContentPlaceHolder_FormView1_BARCODE_NUMLabel`)
- **Submission Date:** Timestamp oficial do envio (ID: `ctl00_SiteContentPlaceHolder_FormView1_litSubmitDate` ou `...lblSubDate`)
- **Consular Post:** A embaixada vinculada. (`ctl00_SiteContentPlaceHolder_FormView1_TARGET_SITE_CD`, `_LINE1`, etc)
- **Código de Barras:** Imagem renderizada no source via ASPX estreme `ImageService.axd`.

> **Extrator de Barcode:** O `src` da tag `<img id="Barcode"...>` ou similar deve ser baixado. Esta imagem é obrigatória no dia da entrevista.

---

## 2. Ações Finais (Routing Hub)

A aplicação apresenta botões utilitários no painel (`summaryAction`), críticos para a Automação exportar os recibos e documentos gerados. Eles funcionam como links de transição para as URLs finais definitivas.

> **Regra Obrigatória de Cronologia (Download Sequence):** O motor **deve precipuamente acionar o botão de acesso ao DS-160 Completo (`Print Application`) ANTES de acionar o de Confirmação (`Print Confirmation`)**. O ato de visitar a aba de Confirmação pode expirar o cache para The Application.

| Ordem | Ação | ID Padrão | Transição FormEngine |
|-------|------|-----------|----------------------|
| **1º** | **Print Application** | `..._FormView1_btnPrintApp` | O trigger roteará a engine para a URL de `Print_Application.aspx`. (Ver página 26) |
| **2º** | **Print Confirmation** | `..._FormView1_btnPrintConfirm` | O trigger roteará a engine para a URL de `Print_Confirmation.aspx`. (Ver página 27) |
| **Email Confirmation**| `..._FormView1_btnEmailConfirm` | Abre modal interno pedindo e-mail. | **Ignorado:** AWS/Backend assumirá esse envio pós-captura. |

---

## 3. Encerramento Sistêmico da Engine Automática

Ao concluir as extrações (Barcode, Application_ID e Exportações PDF/HTML da Print Confirmation), a rotina de automação deve realizar os procedimentos de encerramento (`cleanup` e `callback`):

1. **Atualizar Banco de Dados:** Sincronizar o DB do SENDS160 (via Supabase ou API) marcando este applicant/profile como `COMPLETED / SUBMITTED`.
2. **Associar Anexos:** Realizar o persist dos PDFs gerados no S3/Storage bucket associados ao `application_id`.
3. **Limpar Sessão:** Desacoplar os cookies JSESSIONID/ASP.NET. (Fechamento limpo do navegador headless ou roteador residencial proxy).
4. **Disparar Webhooks:** Acionar os webhooks B2B ou gatilhos de email pro cliente informando a conclusão exitosa e as próximas etapas (agendamento no CASV).

> **Alerta de Segurança:** O CEAC deixa muito claro na documentação desta tela (exibida no painel Oath/Statement) que as informações são auditáveis e permanentes após a assinatura biométrica (nesta etapa virtual resolvida antes). NENHUM campo submetido aqui pode ser alterado retroativamente, exigindo-se recomeçar do zero caso exista erro pós-confirmação.

---
**Fim de Vida da Sessão DS-160**
