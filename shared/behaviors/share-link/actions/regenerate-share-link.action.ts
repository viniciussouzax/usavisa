"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  createShareLink,
  revokeShareLink,
} from "@/shared/models/share-link";
import { getSolicitacaoByUid } from "@/shared/models/solicitacao";

const schema = z.object({
  solicitacaoUid: z.string().min(1),
  previousToken: z.string().optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; token?: string };

/**
 * Gera um novo token para a solicitação, revogando o anterior se existir.
 * Usado quando o link foi vazado — links antigos param de funcionar imediatamente.
 */
export async function regenerateShareLinkAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  const sol = await getSolicitacaoByUid(parsed.data.solicitacaoUid);
  if (!sol) return { error: "Solicitação não encontrada" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(user.id, sol.organizacaoId);
    if (!membership?.ativo) return { error: "Sem permissão" };
  }

  if (parsed.data.previousToken) {
    await revokeShareLink(parsed.data.previousToken);
  }

  const token = await createShareLink({
    solicitacaoUid: sol.uid,
    createdBy: user.id,
  });
  return { error: null, token };
}
