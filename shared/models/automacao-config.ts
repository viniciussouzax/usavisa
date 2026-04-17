import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { globalIntegration } from "@/db/schema";

const CONFIG_ID = "automacao-config";

export type AutomacaoConfig = {
  maxRetries: number;
  cooldownRetry1Min: number;
  cooldownRetry2Min: number;
  timeoutPorRunMin: number;
  custoMaxPorRunUsd: number;
  retryAutoEmFalha: boolean;
};

const DEFAULTS: AutomacaoConfig = {
  maxRetries: 2,
  cooldownRetry1Min: 30,
  cooldownRetry2Min: 60,
  timeoutPorRunMin: 15,
  custoMaxPorRunUsd: 0.5,
  retryAutoEmFalha: true,
};

export async function getAutomacaoConfig(): Promise<AutomacaoConfig> {
  const [row] = await db
    .select()
    .from(globalIntegration)
    .where(eq(globalIntegration.integrationId, CONFIG_ID))
    .limit(1);
  if (!row) return { ...DEFAULTS };
  const stored = row.config as Record<string, unknown>;
  return {
    maxRetries: (stored.maxRetries as number) ?? DEFAULTS.maxRetries,
    cooldownRetry1Min: (stored.cooldownRetry1Min as number) ?? DEFAULTS.cooldownRetry1Min,
    cooldownRetry2Min: (stored.cooldownRetry2Min as number) ?? DEFAULTS.cooldownRetry2Min,
    timeoutPorRunMin: (stored.timeoutPorRunMin as number) ?? DEFAULTS.timeoutPorRunMin,
    custoMaxPorRunUsd: (stored.custoMaxPorRunUsd as number) ?? DEFAULTS.custoMaxPorRunUsd,
    retryAutoEmFalha: (stored.retryAutoEmFalha as boolean) ?? DEFAULTS.retryAutoEmFalha,
  };
}

export async function saveAutomacaoConfig(config: AutomacaoConfig): Promise<void> {
  const [existing] = await db
    .select({ integrationId: globalIntegration.integrationId })
    .from(globalIntegration)
    .where(eq(globalIntegration.integrationId, CONFIG_ID))
    .limit(1);

  if (existing) {
    await db
      .update(globalIntegration)
      .set({ config: config as unknown as Record<string, string>, ativo: true })
      .where(eq(globalIntegration.integrationId, CONFIG_ID));
  } else {
    await db.insert(globalIntegration).values({
      integrationId: CONFIG_ID,
      config: config as unknown as Record<string, string>,
      ativo: true,
    });
  }
}
