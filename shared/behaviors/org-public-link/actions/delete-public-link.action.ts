"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { deletePublicLink } from "@/shared/models/org-public-link";
import { db } from "@/db";
import { orgPublicLink } from "@/db/schema";

const schema = z.object({ id: z.string().min(1) });

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function deletePublicLinkAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "ID inválido" };

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

  await deletePublicLink(parsed.data.id);
  return { error: null };
}
