"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  getOrganizacaoByShortId,
  updateOrganizacao,
} from "@/shared/models/organizacao";

const schema = z.object({
  shortId: z.string().min(1),
  tagline: z.string().max(120).nullable().optional(),
  descricao: z.string().max(300).nullable().optional(),
  footerText: z.string().max(200).nullable().optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updateHotpageTextsAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const org = await getOrganizacaoByShortId(parsed.data.shortId);
  if (!org) return { error: "Organização não encontrada" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, org.uid);
    if (!m?.ativo) return { error: "Sem permissão" };
  }

  const { shortId: _, ...rest } = parsed.data;
  await updateOrganizacao(org.uid, rest);
  return { error: null };
}
