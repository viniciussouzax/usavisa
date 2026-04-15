"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { createPublicLink } from "@/shared/models/org-public-link";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";

const schema = z.object({
  shortId: z.string().min(1),
  label: z.string().min(1).max(80),
  url: z.string().url(),
  descricao: z.string().max(200).optional(),
  icon: z.string().max(8).optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; id?: string };

export async function createPublicLinkAction(input: Input): Promise<Result> {
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

  const link = await createPublicLink({
    organizacaoUid: org.uid,
    label: parsed.data.label,
    url: parsed.data.url,
    descricao: parsed.data.descricao,
    icon: parsed.data.icon,
  });
  return { error: null, id: link.id };
}
