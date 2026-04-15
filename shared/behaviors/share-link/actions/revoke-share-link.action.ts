"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { revokeShareLink } from "@/shared/models/share-link";
import { db } from "@/db";
import { shareLink, solicitacao } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const schema = z.object({
  token: z.string().min(1),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function revokeShareLinkAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Token inválido" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  // Resolve solicitação do token pra checar membership
  const [row] = await db
    .select({ organizacaoUid: solicitacao.organizacaoUid })
    .from(shareLink)
    .innerJoin(solicitacao, eq(solicitacao.uid, shareLink.solicitacaoUid))
    .where(and(eq(shareLink.token, parsed.data.token), isNull(solicitacao.deletedAt)))
    .limit(1);
  if (!row) return { error: "Link não encontrado" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!membership?.ativo) return { error: "Sem permissão" };
  }

  await revokeShareLink(parsed.data.token);
  return { error: null };
}
