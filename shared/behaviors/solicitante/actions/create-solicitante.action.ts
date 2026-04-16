"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { getSolicitacaoByUid } from "@/shared/models/solicitacao";
import { createSolicitante } from "@/shared/models/solicitante";

const schema = z.object({
  solicitacaoUid: z.string().min(1),
  nome: z.string().trim().min(1, "Nome obrigatório").max(200),
  parentesco: z.enum(["Principal", "Cônjuge", "Filho(a)", "Outro"]),
  cpf: z.string().trim().max(20).optional().default(""),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; solicitanteUid?: string };

export async function createSolicitanteAction(input: Input): Promise<Result> {
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

  const created = await createSolicitante({
    solicitacaoUid: sol.uid,
    nome: parsed.data.nome,
    parentesco: parsed.data.parentesco,
    cpf: parsed.data.cpf,
  });

  return { error: null, solicitanteUid: created.id };
}
