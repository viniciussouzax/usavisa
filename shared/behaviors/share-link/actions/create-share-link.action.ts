"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  createShareLink,
  getActiveTokenForSolicitacao,
} from "@/shared/models/share-link";
import { getSolicitacaoByUid } from "@/shared/models/solicitacao";

const schema = z.object({
  solicitacaoUid: z.string().min(1),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; token?: string };

export async function createShareLinkAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  const sol = await getSolicitacaoByUid(parsed.data.solicitacaoUid);
  if (!sol) return { error: "Solicitação não encontrada" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(user.id, sol.organizacaoId);
    if (!membership?.ativo) return { error: "Sem permissão nesta organização" };
  }

  const existing = await getActiveTokenForSolicitacao(sol.uid);
  if (existing) return { error: null, token: existing };

  const token = await createShareLink({
    solicitacaoUid: sol.uid,
    createdBy: user.id,
  });
  return { error: null, token };
}
