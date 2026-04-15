"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { reorderPublicLinks } from "@/shared/models/org-public-link";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";

const schema = z.object({
  shortId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function reorderPublicLinksAction(input: Input): Promise<Result> {
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

  await reorderPublicLinks(org.uid, parsed.data.orderedIds);
  return { error: null };
}
