import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAutomacaoConfig } from "@/shared/models/automacao-config";
import { AutomacaoConfigClient } from "./components/automacao-config-client";

export default async function AutomacaoConfigPage() {
  const { user } = await getUser();
  if (!user || !isMaster(user.role)) notFound();

  const config = await getAutomacaoConfig();

  return (
    <AutomacaoConfigClient
      initialConfig={{
        maxRetries: config.maxRetries ?? 2,
        cooldownRetry1Min: config.cooldownRetry1Min ?? 30,
        cooldownRetry2Min: config.cooldownRetry2Min ?? 60,
        timeoutPorRunMin: config.timeoutPorRunMin ?? 15,
        custoMaxPorRunUsd: config.custoMaxPorRunUsd ?? 0.5,
        retryAutoEmFalha: config.retryAutoEmFalha ?? true,
      }}
    />
  );
}
