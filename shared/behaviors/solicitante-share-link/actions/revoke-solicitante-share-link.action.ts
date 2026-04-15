"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { revokeSolicitanteShareLink } from "@/shared/models/solicitante-share-link";
import { db } from "@/db";
import { solicitacao, solicitante, solicitanteShareLink } from "@/db/schema";

const schema = z.object({
  token: z.string().min(1),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function revokeSolicitanteShareLinkAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Token inválido" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  const [row] = await db
    .select({ organizacaoUid: solicitacao.organizacaoUid })
    .from(solicitanteShareLink)
    .innerJoin(
      solicitante,
      eq(solicitante.uid, solicitanteShareLink.solicitanteUid),
    )
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitanteShareLink.token, parsed.data.token))
    .limit(1);
  if (!row) return { error: "Link não encontrado" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(
      user.id,
      row.organizacaoUid,
    );
    if (!membership?.ativo) return { error: "Sem permissão" };
  }

  await revokeSolicitanteShareLink(parsed.data.token);
  return { error: null };
}
