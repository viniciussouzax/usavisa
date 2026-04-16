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

  const config = org.automacaoConfig;

  return (
    <AutomacaoConfigClient
      organizacaoUid={org.uid}
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
