import "server-only";
import { appendPipelineLog } from "@/shared/models/pipeline-log";
import { updateSolicitante } from "@/shared/models/solicitante";
import { updateActorRun, createActorRun, type ActorRunRow } from "@/shared/models/actor-run";

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
  autoRetry?: boolean;
  validators?: Array<{ id: string; message: string; fieldId?: string }>;
  screenshotKey?: string;
  htmlKey?: string;
  createdAt: string;
};

type DatasetItem = FillLogItem | ErrorLogItem;

type RunData = {
  status: string;
  stats?: { durationMillis?: number };
  usage?: Record<string, number>;
  usageTotalUsd?: number;
};

type RetryConfig = {
  maxRetries: number;
  cooldownRetry1Min: number;
  cooldownRetry2Min: number;
  retryAutoEmFalha: boolean;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  cooldownRetry1Min: 30,
  cooldownRetry2Min: 60,
  retryAutoEmFalha: true,
};

export async function reconcileApifyRun(
  solicitanteUid: string,
  run: ActorRunRow,
  apifyToken: string,
  retryConfig?: Partial<RetryConfig>,
): Promise<{ imported: number; runStatus: string; nextAction: "cascata" | "retry" | "erro" | "falha" }> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const runId = run.apifyRunId!;

  const runRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`,
  );
  if (!runRes.ok) throw new Error(`Apify run fetch failed: ${runRes.status}`);
  const runData = ((await runRes.json()) as { data: RunData }).data;

  if (runData.status === "RUNNING" || runData.status === "READY") {
    return { imported: 0, runStatus: runData.status, nextAction: "erro" };
  }

  const datasetRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyToken}`,
  );
  if (!datasetRes.ok) throw new Error(`Apify dataset fetch failed: ${datasetRes.status}`);
  const items: DatasetItem[] = await datasetRes.json();

  let imported = 0;
  let lastPage: string | undefined;
  let applicationId: string | undefined;
  let totalDurationMs = 0;
  let lastErrorCause: string | undefined;
  let lastErrorAutoRetry = false;
  let lastErrorSeverity: string | undefined;

  for (const item of items) {
    if (item.kind === "fill_log") {
      const fill = item as FillLogItem;
      await appendPipelineLog({
        solicitanteUid,
        evento: "pagina.concluida",
        subEtapa: run.subEtapa,
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
          subEtapa: run.subEtapa,
          tarefa: fill.pageName,
          status: "Erro",
          dados: { campo: ve.fieldId, mensagem: ve.message },
        });
        imported++;
      }
    }

    if (item.kind === "error_log") {
      const err = item as ErrorLogItem;
      lastErrorCause = err.errorCause;
      lastErrorAutoRetry = err.autoRetry ?? false;
      lastErrorSeverity = err.severity;
      await appendPipelineLog({
        solicitanteUid,
        evento: "pagina.erro",
        subEtapa: run.subEtapa,
        tarefa: err.pageName,
        status: err.severity === "data" ? "Erro" : "Falha",
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

  const custoUsd = runData.usageTotalUsd ?? 0;
  const custoDetalhado = {
    computeUnits: runData.usage?.ACTOR_COMPUTE_UNITS ?? 0,
    proxyGb: runData.usage?.PROXY_RESIDENTIAL_TRANSFER_GBYTES ?? 0,
    totalUsd: custoUsd,
  };

  const succeeded = runData.status === "SUCCEEDED";

  await appendPipelineLog({
    solicitanteUid,
    evento: succeeded ? "automacao.concluida" : "automacao.erro",
    subEtapa: run.subEtapa,
    status: succeeded ? "Concluido" : "Erro",
    duracaoMs: totalDurationMs || runData.stats?.durationMillis,
    dados: {
      runId,
      runStatus: runData.status,
      applicationId,
      paginasProcessadas: items.filter((i) => i.kind === "fill_log").length,
      ultimaPagina: lastPage,
      custo: custoDetalhado,
    },
  });

  await updateActorRun(run.id, {
    status: succeeded ? "Concluido" : (lastErrorSeverity === "data" ? "Erro" : "Falha"),
    applicationId: applicationId ?? run.applicationId,
    custoUsd,
    duracaoMs: totalDurationMs || runData.stats?.durationMillis,
    erroTipo: succeeded ? undefined : lastErrorSeverity,
    erroMensagem: succeeded ? undefined : `[${lastErrorCause}]`,
  });

  if (succeeded) {
    await updateSolicitante(solicitanteUid, {
      status: "Concluido",
      tarefaAtual: null,
    });
    return { imported, runStatus: runData.status, nextAction: "cascata" };
  }

  const isDataError = lastErrorSeverity === "data" || !lastErrorAutoRetry;

  if (isDataError) {
    await updateSolicitante(solicitanteUid, {
      status: "Erro",
      tarefaAtual: lastPage ? `${run.subEtapa}.${lastPage}` : null,
    });
    return { imported, runStatus: runData.status, nextAction: "erro" };
  }

  if (!config.retryAutoEmFalha || run.tentativa >= config.maxRetries + 1) {
    await updateSolicitante(solicitanteUid, {
      status: "Falha",
      tarefaAtual: lastPage ? `${run.subEtapa}.${lastPage}` : null,
    });
    return { imported, runStatus: runData.status, nextAction: "falha" };
  }

  const nextTentativa = run.tentativa + 1;
  const cooldownMin = nextTentativa === 2 ? config.cooldownRetry1Min : config.cooldownRetry2Min;
  const agendadoPara = new Date(Date.now() + cooldownMin * 60_000);

  await createActorRun({
    solicitanteUid,
    subEtapa: run.subEtapa,
    actorId: run.actorId,
    tentativa: nextTentativa,
    applicationId: applicationId ?? run.applicationId ?? undefined,
    agendadoPara,
  });

  await updateSolicitante(solicitanteUid, {
    status: "Espera",
    tarefaAtual: lastPage ? `${run.subEtapa}.${lastPage}` : null,
  });

  await appendPipelineLog({
    solicitanteUid,
    evento: "retry.agendado",
    subEtapa: run.subEtapa,
    status: "Espera",
    dados: {
      tentativa: nextTentativa,
      cooldownMin,
      agendadoPara: agendadoPara.toISOString(),
      applicationId: applicationId ?? run.applicationId,
    },
  });

  return { imported, runStatus: runData.status, nextAction: "retry" };
}
