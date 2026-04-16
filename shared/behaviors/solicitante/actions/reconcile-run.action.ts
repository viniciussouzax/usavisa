"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { getDs160Credentials } from "@/shared/integrations/ds160/get-credentials";
import { reconcileApifyRun } from "@/shared/integrations/ds160/reconcile";

const schema = z.object({
  solicitanteUid: z.string().min(1),
  runId: z.string().min(1),
});

type Result =
  | { ok: true; imported: number; runStatus: string }
  | { ok: false; error: string };

export async function reconcileRunAction(
  input: z.input<typeof schema>,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados invalidos" };

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
  if (!row) return { ok: false, error: "Solicitante nao encontrado" };

  const { user } = await getUser();
  if (!user) return { ok: false, error: "Nao autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!m?.ativo) return { ok: false, error: "Sem permissao" };
  }

  try {
    const creds = await getDs160Credentials({ stage: "ceac-ds160" });
    const result = await reconcileApifyRun(
      parsed.data.solicitanteUid,
      parsed.data.runId,
      creds.apify.apiToken,
    );
    return { ok: true, imported: result.imported, runStatus: result.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao reconciliar";
    return { ok: false, error: message };
  }
}
