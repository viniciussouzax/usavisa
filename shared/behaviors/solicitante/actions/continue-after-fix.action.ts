"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { getFormDataForSolicitante } from "@/shared/models/form-data";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { toDS160Applicant } from "@/shared/integrations/ds160/to-applicant";
import { dispatchDs160Run } from "@/shared/integrations/ds160/dispatch";
import { getDs160Credentials } from "@/shared/integrations/ds160/get-credentials";
import { getLatestActorRun, createActorRun, updateActorRun } from "@/shared/models/actor-run";
import { updateSolicitante } from "@/shared/models/solicitante";
import { appendPipelineLog } from "@/shared/models/pipeline-log";

const schema = z.object({ solicitanteUid: z.string().min(1) });

type Result =
  | { ok: true; runId: string }
  | { ok: false; error: string };

export async function continueAfterFixAction(
  input: z.input<typeof schema>,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados invalidos" };

  const [row] = await db
    .select({ organizacaoUid: solicitacao.organizacaoUid })
    .from(solicitante)
    .innerJoin(solicitacao, and(eq(solicitacao.uid, solicitante.solicitacaoUid), isNull(solicitacao.deletedAt)))
    .where(eq(solicitante.uid, parsed.data.solicitanteUid))
    .limit(1);
  if (!row) return { ok: false, error: "Nao encontrado" };

  const { user } = await getUser();
  if (!user) return { ok: false, error: "Nao autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!m?.ativo) return { ok: false, error: "Sem permissao" };
  }

  const prevRun = await getLatestActorRun(parsed.data.solicitanteUid);
  const applicationId = prevRun?.applicationId ?? undefined;
  const subEtapa = prevRun?.subEtapa ?? "ds160";
  const tentativa = (prevRun?.tentativa ?? 0) + 1;

  const snapshot = await getFormDataForSolicitante(parsed.data.solicitanteUid);
  if (!snapshot.updatedAt) return { ok: false, error: "Formulario nao preenchido" };

  const applicant = toDS160Applicant({
    data: snapshot.data,
    arrayData: snapshot.arrayData,
    visitedSections: snapshot.visitedSections,
    naFields: snapshot.naFields,
    unknownFields: snapshot.unknownFields,
  });

  try {
    const creds = await getDs160Credentials({ stage: "ceac-ds160" });
    const result = await dispatchDs160Run(applicant, {
      apifyApiToken: creds.apify.apiToken,
      apifyActorId: creds.apify.actorId,
      capmonsterApiKey: creds.capmonsterApiKey,
    }, { applicationId });

    const runId = await createActorRun({
      solicitanteUid: parsed.data.solicitanteUid,
      subEtapa,
      actorId: creds.apify.actorId,
      tentativa,
      applicationId,
    });
    await updateActorRun(runId, { status: "Executando", apifyRunId: result.runId });
    await updateSolicitante(parsed.data.solicitanteUid, { status: "Executando" });
    await appendPipelineLog({
      solicitanteUid: parsed.data.solicitanteUid,
      evento: "retry.manual",
      subEtapa,
      status: "Executando",
      dados: { tentativa, runId: result.runId, applicationId, motivo: "assessor corrigiu dados" },
    });

    return { ok: true, runId: result.runId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao disparar" };
  }
}
