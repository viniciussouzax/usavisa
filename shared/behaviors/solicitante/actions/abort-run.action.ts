"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { getLatestActorRun, updateActorRun } from "@/shared/models/actor-run";
import { updateSolicitante } from "@/shared/models/solicitante";
import { appendPipelineLog } from "@/shared/models/pipeline-log";
import { getDs160Credentials } from "@/shared/integrations/ds160/get-credentials";

const schema = z.object({ solicitanteUid: z.string().min(1) });

type Result = { ok: boolean; error?: string };

export async function abortRunAction(input: z.input<typeof schema>): Promise<Result> {
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

  const run = await getLatestActorRun(parsed.data.solicitanteUid);
  if (!run || run.status !== "Executando" || !run.apifyRunId) {
    return { ok: false, error: "Nenhuma run em execucao" };
  }

  try {
    const creds = await getDs160Credentials({ stage: "ceac-ds160" });
    await fetch(
      `https://api.apify.com/v2/actor-runs/${run.apifyRunId}/abort?token=${creds.apify.apiToken}`,
      { method: "POST" },
    );
  } catch {
    // best-effort
  }

  await updateActorRun(run.id, { status: "Falha", erroMensagem: "Abortado pelo assessor" });
  await updateSolicitante(parsed.data.solicitanteUid, { status: "Falha" });
  await appendPipelineLog({
    solicitanteUid: parsed.data.solicitanteUid,
    evento: "automacao.abortada",
    subEtapa: run.subEtapa,
    status: "Falha",
    dados: { runId: run.apifyRunId, motivo: "assessor" },
  });

  return { ok: true };
}
