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
import { appendPipelineLog } from "@/shared/models/pipeline-log";
import { updateSolicitante } from "@/shared/models/solicitante";

const schema = z.object({
  solicitanteUid: z.string().min(1),
  mode: z.enum(["real", "dry_run"]).default("real"),
});

type Result =
  | { ok: true; error: null; runId: string; consoleUrl: string; status: string }
  | { ok: false; error: string };

export async function dispatchDs160RunAction(
  input: z.input<typeof schema>,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };

  const [row] = await db
    .select({ organizacaoUid: solicitacao.organizacaoUid })
    .from(solicitante)
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitante.uid, parsed.data.solicitanteUid))
    .limit(1);
  if (!row) return { ok: false, error: "Solicitante não encontrado" };

  const { user } = await getUser();
  if (!user) return { ok: false, error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!m?.ativo) return { ok: false, error: "Sem permissão" };
  }

  const snapshot = await getFormDataForSolicitante(parsed.data.solicitanteUid);
  if (!snapshot.updatedAt) {
    return { ok: false, error: "Solicitante ainda não preencheu o formulário" };
  }

  const applicant = toDS160Applicant({
    data: snapshot.data,
    arrayData: snapshot.arrayData,
    visitedSections: snapshot.visitedSections,
    naFields: snapshot.naFields,
    unknownFields: snapshot.unknownFields,
  });

  try {
    const creds = await getDs160Credentials({ stage: "ceac-ds160" });
    const result = await dispatchDs160Run(
      applicant,
      {
        apifyApiToken: creds.apify.apiToken,
        apifyActorId: creds.apify.actorId,
        capmonsterApiKey: creds.capmonsterApiKey,
      },
      { mode: parsed.data.mode },
    );
    await updateSolicitante(parsed.data.solicitanteUid, {
      etapa: "Automacao",
      status: "Executando",
      subEtapa: "ds160",
      tarefaAtual: "ds160.01_apply",
    });
    await appendPipelineLog({
      solicitanteUid: parsed.data.solicitanteUid,
      evento: "automacao.iniciada",
      subEtapa: "ds160",
      tarefa: "ds160.01_apply",
      status: "Executando",
      dados: { runId: result.runId, actorId: creds.apify.actorId },
    });
    return { ok: true, error: null, runId: result.runId, consoleUrl: result.consoleUrl, status: result.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao disparar automação";
    return { ok: false, error: message };
  }
}
