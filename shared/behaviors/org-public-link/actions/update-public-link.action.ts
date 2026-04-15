"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { updatePublicLink } from "@/shared/models/org-public-link";
import { db } from "@/db";
import { orgPublicLink } from "@/db/schema";

const schema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80).optional(),
  url: z.string().url().optional(),
  descricao: z.string().max(200).nullable().optional(),
  icon: z.string().max(8).nullable().optional(),
  ativo: z.boolean().optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updatePublicLinkAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const [row] = await db
    .select({ organizacaoUid: orgPublicLink.organizacaoUid })
    .from(orgPublicLink)
    .where(eq(orgPublicLink.id, parsed.data.id))
    .limit(1);
  if (!row) return { error: "Link não encontrado" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
    if (!m?.ativo) return { error: "Sem permissão" };
  }

  const { id, ...rest } = parsed.data;
  await updatePublicLink(id, rest);
  return { error: null };
}
