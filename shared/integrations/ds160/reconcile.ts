import "server-only";
import { appendPipelineLog } from "@/shared/models/pipeline-log";
import { updateSolicitante } from "@/shared/models/solicitante";

type FillLogItem = {
  kind: "fill_log";
  pageName: string;
  fieldsFilled: number;
  fieldsTotal: number;
  validationErrors: Array<{ message: string; fieldId?: string }>;
  durationMs: number;
  attempts: number;
  applicationId?: string;
  createdAt: string;
};

type ErrorLogItem = {
  kind: "error_log";
  pageName?: string;
  fieldName?: string;
  errorMessage: string;
  errorCause: string;
  severity: string;
  validators?: Array<{ id: string; message: string; fieldId?: string }>;
  screenshotKey?: string;
  htmlKey?: string;
  createdAt: string;
};

type DatasetItem = FillLogItem | ErrorLogItem;

type RunStatus = "SUCCEEDED" | "FAILED" | "ABORTED" | "TIMED-OUT" | string;

export async function reconcileApifyRun(
  solicitanteUid: string,
  runId: string,
  apifyToken: string,
): Promise<{ imported: number; status: RunStatus }> {
  const runRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`,
  );
  if (!runRes.ok) throw new Error(`Apify run fetch failed: ${runRes.status}`);
  const run = ((await runRes.json()) as { data: { status: RunStatus; stats?: { durationMillis?: number } } }).data;

  const datasetRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`,
  );
  if (!datasetRes.ok) throw new Error(`Apify dataset fetch failed: ${datasetRes.status}`);
  const items: DatasetItem[] = await datasetRes.json();

  let imported = 0;
  let lastPage: string | undefined;
  let applicationId: string | undefined;
  let totalDurationMs = 0;

  for (const item of items) {
    if (item.kind === "fill_log") {
      const fill = item as FillLogItem;
      await appendPipelineLog({
        solicitanteUid,
        evento: "pagina.concluida",
        subEtapa: "ds160",
        tarefa: fill.pageName,
        status: "Concluido",
        duracaoMs: fill.durationMs,
        dados: {
          fieldsFilled: fill.fieldsFilled,
          fieldsTotal: fill.fieldsTotal,
          attempts: fill.attempts,
          validationErrors: fill.validationErrors.length > 0 ? fill.validationErrors : undefined,
        },
      });
      lastPage = fill.pageName;
      totalDurationMs += fill.durationMs;
      if (fill.applicationId) applicationId = fill.applicationId;
      imported++;

      for (const ve of fill.validationErrors) {
        await appendPipelineLog({
          solicitanteUid,
          evento: "input.erro",
          subEtapa: "ds160",
          tarefa: fill.pageName,
          status: "Erro",
          dados: { campo: ve.fieldId, mensagem: ve.message },
        });
        imported++;
      }
    }

    if (item.kind === "error_log") {
      const err = item as ErrorLogItem;
      await appendPipelineLog({
        solicitanteUid,
        evento: "pagina.erro",
        subEtapa: "ds160",
        tarefa: err.pageName,
        status: err.severity === "operational" ? "Espera" : "Erro",
        dados: {
          causa: err.errorCause,
          mensagem: err.errorMessage,
          campo: err.fieldName,
          screenshotKey: err.screenshotKey,
          htmlKey: err.htmlKey,
          validators: err.validators,
        },
      });
      imported++;
    }
  }

  const succeeded = run.status === "SUCCEEDED";
  await appendPipelineLog({
    solicitanteUid,
    evento: succeeded ? "automacao.concluida" : "automacao.erro",
    subEtapa: "ds160",
    status: succeeded ? "Concluido" : "Erro",
    duracaoMs: totalDurationMs || run.stats?.durationMillis,
    dados: {
      runId,
      runStatus: run.status,
      applicationId,
      paginasProcessadas: items.filter((i) => i.kind === "fill_log").length,
      ultimaPagina: lastPage,
    },
  });

  const newStatus = succeeded ? "Concluido" : "Erro";
  const newTarefa = succeeded ? undefined : lastPage ? `ds160.${lastPage}` : undefined;
  await updateSolicitante(solicitanteUid, {
    status: newStatus,
    tarefaAtual: newTarefa ?? null,
  });

  return { imported, status: run.status };
}
