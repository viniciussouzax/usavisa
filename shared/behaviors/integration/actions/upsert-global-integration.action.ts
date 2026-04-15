"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { upsertGlobalIntegration } from "@/shared/models/integration";

const schema = z.object({
  integrationId: z.string().min(1),
  config: z.record(z.string(), z.string()),
  ativo: z.boolean(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

/**
 * Integrações globais ficam só na mão do Master (ex: Resend, Vercel Blob,
 * GitHub). Per-org usa `upsertOrgIntegrationAction`.
 */
export async function upsertGlobalIntegrationAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) return { error: "Apenas master" };

  await upsertGlobalIntegration(parsed.data);
  return { error: null };
}
