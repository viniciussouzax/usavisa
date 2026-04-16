"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { db } from "@/db";
import { organizacao } from "@/db/schema";

const schema = z.object({
  organizacaoUid: z.string().min(1),
  config: z.object({
    maxRetries: z.number().min(0).max(5).default(2),
    cooldownRetry1Min: z.number().min(1).max(360).default(30),
    cooldownRetry2Min: z.number().min(1).max(720).default(60),
    timeoutPorRunMin: z.number().min(5).max(60).default(15),
    custoMaxPorRunUsd: z.number().min(0.01).max(10).default(0.5),
    retryAutoEmFalha: z.boolean().default(true),
  }),
});

type Result = { error: string | null };

export async function updateAutomacaoConfigAction(
  input: z.input<typeof schema>,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados invalidos" };

  const { user } = await getUser();
  if (!user) return { error: "Nao autenticado" };

  const [org] = await db
    .select({ uid: organizacao.uid })
    .from(organizacao)
    .where(eq(organizacao.uid, parsed.data.organizacaoUid))
    .limit(1);
  if (!org) return { error: "Organizacao nao encontrada" };

  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, org.uid);
    if (!m?.ativo || m.role !== "owner") return { error: "Sem permissao (requer owner)" };
  }

  await db
    .update(organizacao)
    .set({ automacaoConfig: parsed.data.config, updatedAt: new Date() })
    .where(eq(organizacao.uid, org.uid));

  return { error: null };
}
