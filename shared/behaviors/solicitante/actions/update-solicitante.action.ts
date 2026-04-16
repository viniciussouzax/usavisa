"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { updateSolicitante } from "@/shared/models/solicitante";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { ETAPAS, STATUSES } from "@/app/data";

const schema = z.object({
  uid: z.string().min(1),
  nome: z.string().min(1).max(120).optional(),
  parentesco: z
    .enum(["Principal", "Cônjuge", "Filho(a)", "Outro"] as const)
    .optional(),
  cpf: z.string().max(20).optional(),
  etapa: z.enum(ETAPAS).optional(),
  status: z.enum(STATUSES).optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updateSolicitanteAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

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
    .where(eq(solicitante.uid, parsed.data.uid))
    .limit(1);
  if (!row) return { error: "Solicitante não encontrado" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!m?.ativo) return { error: "Sem permissão" };
  }

  const { uid, ...rest } = parsed.data;
  await updateSolicitante(uid, rest);
  return { error: null };
}
