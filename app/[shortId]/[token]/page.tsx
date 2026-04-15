import { notFound, redirect } from "next/navigation";
import { sortSolicitantes } from "@/app/data";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import {
  getShareTokenStatus,
  resolveShareToken,
} from "@/shared/models/share-link";
import {
  getSolicitanteShareTokenStatus,
  resolveSolicitanteShareToken,
} from "@/shared/models/solicitante-share-link";
import { listSolicitantesBySolicitacao } from "@/shared/models/solicitante";
import { getFormDataForSolicitante } from "@/shared/models/form-data";
import { PublicSolicitacaoClient } from "./components/public-solicitacao-client";
import { PublicSolicitanteClient } from "./components/public-solicitante-client";
import { ShareLinkEnded } from "./components/share-link-ended";

export default async function OrgSharePage({
  params,
}: {
  params: Promise<{ shortId: string; token: string }>;
}) {
  const { shortId, token } = await params;

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  // 1) Tenta resolver como token de caso (lista de solicitantes)
  const asCase = await resolveShareToken(token);
  if (asCase) {
    if (asCase.solicitacao.organizacaoId !== organizacao.uid) {
      redirect(`/${shortId}`);
    }
    const solicitantes = sortSolicitantes(
      await listSolicitantesBySolicitacao(asCase.solicitacao.uid),
    );
    return (
      <PublicSolicitacaoClient
        organizacao={organizacao}
        solicitacao={asCase.solicitacao}
        solicitantes={solicitantes}
        token={token}
      />
    );
  }

  // 2) Tenta resolver como token individual de solicitante
  const asApplicant = await resolveSolicitanteShareToken(token);
  if (asApplicant) {
    if (asApplicant.solicitacao.organizacaoId !== organizacao.uid) {
      redirect(`/${shortId}`);
    }
    const snapshot = await getFormDataForSolicitante(
      asApplicant.solicitante.id,
    );
    return (
      <PublicSolicitanteClient
        organizacao={organizacao}
        solicitante={asApplicant.solicitante}
        solicitacao={asApplicant.solicitacao}
        token={token}
        initialFormSnapshot={snapshot}
      />
    );
  }

  // 3) Não resolveu — checa status revogado/expirado em ambas as tabelas
  const caseStatus = await getShareTokenStatus(token);
  if (
    (caseStatus.kind === "revoked" || caseStatus.kind === "expired") &&
    caseStatus.organizacaoUid === organizacao.uid
  ) {
    return <ShareLinkEnded organizacao={organizacao} reason={caseStatus.kind} />;
  }

  const applicantStatus = await getSolicitanteShareTokenStatus(token);
  if (
    (applicantStatus.kind === "revoked" ||
      applicantStatus.kind === "expired") &&
    applicantStatus.organizacaoUid === organizacao.uid
  ) {
    return (
      <ShareLinkEnded organizacao={organizacao} reason={applicantStatus.kind} />
    );
  }

  redirect(`/${shortId}`);
}
