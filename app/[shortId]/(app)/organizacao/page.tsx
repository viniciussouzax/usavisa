import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { OrganizacaoDetailClient } from "@/components/layout/organizacao-detail";
import { getAssessoresByOrg } from "@/shared/models/assessor";
import { listOrgIntegrations } from "@/shared/models/integration";
import {
  countSolicitacoesByOrg,
  getOrganizacaoByShortId,
} from "@/shared/models/organizacao";

export default async function OrganizacaoPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const { user } = await getUser();
  const [assessores, integracoes, solicitacoesCount] = await Promise.all([
    getAssessoresByOrg(organizacao.uid),
    listOrgIntegrations(organizacao.uid),
    countSolicitacoesByOrg(organizacao.uid),
  ]);
  const userIsMaster = isMaster(user?.role);

  return (
    <OrganizacaoDetailClient
      organizacao={organizacao}
      assessores={assessores}
      integracoes={integracoes}
      solicitacoesCount={solicitacoesCount}
      isMasterUser={userIsMaster}
    />
  );
}
