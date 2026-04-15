"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  getSolicitacaoByUid,
  updateSolicitacao,
} from "@/shared/models/solicitacao";
import { ETAPAS, STATUSES } from "@/app/data";

const schema = z.object({
  uid: z.string().min(1),
  nome: z.string().min(1).max(120).optional(),
  nota: z.string().max(2000).optional(),
  url: z.string().max(500).optional(),
  etapa: z.enum(ETAPAS).optional(),
  status: z.enum(STATUSES).optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updateSolicitacaoAction(input: Input): Promise<Result> {
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

  const { uid, ...rest } = parsed.data;
  await updateSolicitacao(uid, rest);
  return { error: null };
}
