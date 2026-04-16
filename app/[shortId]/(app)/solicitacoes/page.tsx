import { notFound } from "next/navigation";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { listSolicitacoesByOrg } from "@/shared/models/solicitacao";
import { getActiveTokensForOrg } from "@/shared/models/share-link";
import { SolicitacoesClient } from "./components/solicitacoes-client";

export default async function SolicitacoesPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const [solicitacoes, shareTokens] = await Promise.all([
    listSolicitacoesByOrg(organizacao.uid),
    getActiveTokensForOrg(organizacao.uid),
  ]);

  return (
    <SolicitacoesClient
      shortId={shortId}
      organizacaoUid={organizacao.uid}
      solicitacoes={solicitacoes}
      shareTokens={shareTokens}
    />
  );
}
