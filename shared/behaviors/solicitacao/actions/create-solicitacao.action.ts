"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { createSolicitacao } from "@/shared/models/solicitacao";

const schema = z.object({
  organizacaoUid: z.string().min(1),
  nome: z.string().trim().min(1, "Nome obrigatório").max(200),
  nota: z.string().trim().max(2000).optional().default(""),
  url: z.string().trim().max(500).optional().default(""),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; solicitacaoUid?: string };

export async function createSolicitacaoAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  // Authz: master ou assessor ativo da org
  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(
      user.id,
      parsed.data.organizacaoUid,
    );
    if (!membership?.ativo) return { error: "Sem permissão nesta organização" };
  }

  const created = await createSolicitacao({
    organizacaoUid: parsed.data.organizacaoUid,
    nome: parsed.data.nome,
    nota: parsed.data.nota,
    url: parsed.data.url,
    createdBy: user.id,
  });

  return { error: null, solicitacaoUid: created.uid };
}
