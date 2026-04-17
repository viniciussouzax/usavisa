"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { saveAutomacaoConfig } from "@/shared/models/automacao-config";

const schema = z.object({
  maxRetries: z.number().min(0).max(5).default(2),
  cooldownRetry1Min: z.number().min(1).max(360).default(30),
  cooldownRetry2Min: z.number().min(1).max(720).default(60),
  timeoutPorRunMin: z.number().min(5).max(60).default(15),
  custoMaxPorRunUsd: z.number().min(0.01).max(10).default(0.5),
  retryAutoEmFalha: z.boolean().default(true),
});

type Result = { error: string | null };

export async function updateAutomacaoConfigAction(
  input: z.input<typeof schema>,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados invalidos" };

  const { user } = await getUser();
  if (!user) return { error: "Nao autenticado" };
  if (!isMaster(user.role)) return { error: "Acesso restrito ao master" };

  await saveAutomacaoConfig(parsed.data);
  return { error: null };
}
