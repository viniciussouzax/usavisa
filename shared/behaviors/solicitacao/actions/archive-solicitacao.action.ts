"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  archiveSolicitacao,
  deleteSolicitacao,
  getSolicitacaoByUid,
} from "@/shared/models/solicitacao";

const schema = z.object({
  uid: z.string().min(1),
  mode: z.enum(["archive", "delete"]).default("archive"),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

/**
 * `archive` = soft delete via deletedAt (pode voltar).
 * `delete` = hard delete, cascateia solicitantes e share links.
 */
export async function archiveSolicitacaoAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const sol = await getSolicitacaoByUid(parsed.data.uid);
  if (!sol) return { error: "Solicitação não encontrada" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, sol.organizacaoId);
    if (!m?.ativo) return { error: "Sem permissão" };
  }

  if (parsed.data.mode === "delete") {
    await deleteSolicitacao(parsed.data.uid);
  } else {
    await archiveSolicitacao(parsed.data.uid);
  }
  return { error: null };
}
