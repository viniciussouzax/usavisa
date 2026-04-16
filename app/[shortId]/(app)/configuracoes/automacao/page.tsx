import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { AutomacaoConfigClient } from "./components/automacao-config-client";

export default async function AutomacaoConfigPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const org = await getOrganizacaoByShortId(shortId);
  if (!org) notFound();

  const { user } = await getUser();
  if (!user) notFound();
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, org.uid);
    if (!m?.ativo) notFound();
  }

  const config = (org as unknown as { automacaoConfig?: Record<string, unknown> }).automacaoConfig ?? {};

  return (
    <AutomacaoConfigClient
      organizacaoUid={org.uid}
      initialConfig={{
        maxRetries: (config.maxRetries as number) ?? 2,
        cooldownRetry1Min: (config.cooldownRetry1Min as number) ?? 30,
        cooldownRetry2Min: (config.cooldownRetry2Min as number) ?? 60,
        timeoutPorRunMin: (config.timeoutPorRunMin as number) ?? 15,
        custoMaxPorRunUsd: (config.custoMaxPorRunUsd as number) ?? 0.5,
        retryAutoEmFalha: (config.retryAutoEmFalha as boolean) ?? true,
      }}
    />
  );
}
