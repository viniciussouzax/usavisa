"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  createSolicitanteShareLink,
  revokeSolicitanteShareLink,
} from "@/shared/models/solicitante-share-link";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";

const schema = z.object({
  solicitanteUid: z.string().min(1),
  previousToken: z.string().optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; token?: string };

/**
 * Gera (ou regenera) o token individual de um solicitante.
 * Se previousToken estiver presente, revoga antes de criar o novo.
 */
export async function regenerateSolicitanteShareLinkAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

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
  if (!row) return { error: "Solicitante não encontrado" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(
      user.id,
      row.organizacaoUid,
    );
    if (!membership?.ativo) return { error: "Sem permissão" };
  }

  if (parsed.data.previousToken) {
    await revokeSolicitanteShareLink(parsed.data.previousToken);
  }

  const token = await createSolicitanteShareLink({
    solicitanteUid: parsed.data.solicitanteUid,
    createdBy: user.id,
  });
  return { error: null, token };
}
