import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { globalIntegration } from "@/db/schema";
import {
  getRunsToExecute,
  getRunsInProgress,
  updateActorRun,
  createActorRun,
} from "@/shared/models/actor-run";
import { updateSolicitante } from "@/shared/models/solicitante";
import { appendPipelineLog } from "@/shared/models/pipeline-log";
import { getDs160Credentials } from "@/shared/integrations/ds160/get-credentials";
import { dispatchDs160Run } from "@/shared/integrations/ds160/dispatch";
import { reconcileApifyRun } from "@/shared/integrations/ds160/reconcile";
import { getFormDataForSolicitante } from "@/shared/models/form-data";
import { toDS160Applicant } from "@/shared/integrations/ds160/to-applicant";
import { actorIdKey, type ApifyStageSlug } from "@/shared/integrations/apify/stages";

const SUB_ETAPA_ORDEM = ["ds160", "cadastro-taxa", "monitoramento", "agendamento"];

const SUB_ETAPA_STAGE: Record<string, ApifyStageSlug> = {
  "ds160": "ceac-ds160",
  "cadastro-taxa": "ais-cadastro-taxa",
  "monitoramento": "ais-monitoramento",
  "agendamento": "ais-agendamento",
};

function proximaSubEtapa(atual: string): string | null {
  const idx = SUB_ETAPA_ORDEM.indexOf(atual);
  return idx >= 0 && idx < SUB_ETAPA_ORDEM.length - 1 ? SUB_ETAPA_ORDEM[idx + 1] : null;
}

type OrchestrateResult = {
  dispatched: number;
  reconciled: number;
  cascaded: number;
  errors: string[];
};

async function getApifyToken(): Promise<string | null> {
  const rows = await db.select().from(globalIntegration).where(eq(globalIntegration.integrationId, "apify"));
  return (rows[0]?.config as Record<string, string>)?.apiToken ?? null;
}

async function getActorIdForStage(stage: ApifyStageSlug): Promise<string | null> {
  const rows = await db.select().from(globalIntegration).where(eq(globalIntegration.integrationId, "apify"));
  const config = (rows[0]?.config as Record<string, string>) ?? {};
  return config[actorIdKey(stage)] ?? null;
}

export async function orchestrate(): Promise<OrchestrateResult> {
  const result: OrchestrateResult = { dispatched: 0, reconciled: 0, cascaded: 0, errors: [] };

  const apifyToken = await getApifyToken();
  if (!apifyToken) {
    result.errors.push("Apify API token nao configurado");
    return result;
  }

  // 1. Reconciliar runs em Executando que ja terminaram
  const inProgress = await getRunsInProgress();
  for (const run of inProgress) {
    if (!run.apifyRunId) continue;
    try {
      const checkRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${run.apifyRunId}?token=${apifyToken}`,
      );
      if (!checkRes.ok) continue;
      const runData = ((await checkRes.json()) as { data: { status: string } }).data;
      if (runData.status === "RUNNING" || runData.status === "READY") continue;

      const rec = await reconcileApifyRun(run.solicitanteUid, run, apifyToken);
      result.reconciled++;

      if (rec.nextAction === "cascata") {
        const next = proximaSubEtapa(run.subEtapa);
        if (next) {
          const stage = SUB_ETAPA_STAGE[next];
          const actorSlug = stage ? await getActorIdForStage(stage) : null;
          if (actorSlug) {
            await createActorRun({
              solicitanteUid: run.solicitanteUid,
              subEtapa: next,
              actorId: actorSlug,
            });
            await updateSolicitante(run.solicitanteUid, {
              subEtapa: next,
              status: "Pendente",
              tarefaAtual: null,
            });
            await appendPipelineLog({
              solicitanteUid: run.solicitanteUid,
              evento: "cascata.avancou",
              subEtapa: next,
              status: "Pendente",
            });
            result.cascaded++;
          }
        } else {
          await updateSolicitante(run.solicitanteUid, {
            etapa: "Entrevista",
            status: "Pendente",
            subEtapa: null,
            tarefaAtual: null,
          });
          await appendPipelineLog({
            solicitanteUid: run.solicitanteUid,
            evento: "etapa.mudou",
            dados: { de: "Automação", para: "Entrevista" },
          });
        }
      }
    } catch (err) {
      result.errors.push(`reconcile ${run.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 2. Disparar runs agendadas (retries cujo cooldown ja passou)
  const scheduled = await getRunsToExecute();
  for (const run of scheduled) {
    try {
      const stage = SUB_ETAPA_STAGE[run.subEtapa] ?? "ceac-ds160";
      const creds = await getDs160Credentials({ stage });
      const snapshot = await getFormDataForSolicitante(run.solicitanteUid);
      const applicant = toDS160Applicant({
        data: snapshot.data,
        arrayData: snapshot.arrayData,
        visitedSections: snapshot.visitedSections,
        naFields: snapshot.naFields,
        unknownFields: snapshot.unknownFields,
      });

      const dispResult = await dispatchDs160Run(applicant, {
        apifyApiToken: creds.apify.apiToken,
        apifyActorId: creds.apify.actorId,
        capmonsterApiKey: creds.capmonsterApiKey,
      }, { applicationId: run.applicationId ?? undefined });

      await updateActorRun(run.id, {
        status: "Executando",
        apifyRunId: dispResult.runId,
      });
      await updateSolicitante(run.solicitanteUid, { status: "Executando" });
      await appendPipelineLog({
        solicitanteUid: run.solicitanteUid,
        evento: "retry.executando",
        subEtapa: run.subEtapa,
        status: "Executando",
        dados: { tentativa: run.tentativa, runId: dispResult.runId },
      });
      result.dispatched++;
    } catch (err) {
      result.errors.push(`dispatch ${run.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 3. Disparar runs Pendentes (cascata recem-criada)
  const pending = await getRunsToExecute(); // reutiliza — Pendente sem agendamento tambem aparece
  // Runs Pendentes sem agendadoPara sao tratadas aqui — mas getRunsToExecute filtra por Agendado.
  // Pendentes imediatas ja sao disparadas na action. Orchestrador cuida so de agendadas.

  return result;
}
