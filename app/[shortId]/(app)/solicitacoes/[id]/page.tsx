import { notFound } from "next/navigation";
import { sortSolicitantes } from "@/app/data";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { getLatestShareLinkForSolicitacao } from "@/shared/models/share-link";
import { getSolicitacaoByOrgAndHumanId } from "@/shared/models/solicitacao";
import { listSolicitantesBySolicitacao } from "@/shared/models/solicitante";
import { getLatestShareLinkForSolicitante } from "@/shared/models/solicitante-share-link";
import { getFormDataForSolicitante } from "@/shared/models/form-data";
import { getPipelineLogs } from "@/shared/models/pipeline-log";
import { SolicitanteListClient } from "./components/solicitantes-client";

export default async function SolicitacaoDetailPage({
  params,
}: {
  params: Promise<{ shortId: string; id: string }>;
}) {
  const { shortId, id } = await params;
  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const humanId = Number(id);
  if (!Number.isFinite(humanId)) notFound();

  const solicitacao = await getSolicitacaoByOrgAndHumanId(organizacao.uid, humanId);
  if (!solicitacao) notFound();

  const [solicitantes, shareLink] = await Promise.all([
    listSolicitantesBySolicitacao(solicitacao.uid).then(sortSolicitantes),
    getLatestShareLinkForSolicitacao(solicitacao.uid),
  ]);

  const applicantLinks = await Promise.all(
    solicitantes.map(async (s) => {
      const link = await getLatestShareLinkForSolicitante(s.id);
      return [s.id, link ?? null] as const;
    }),
  );
  const initialApplicantLinks = Object.fromEntries(applicantLinks);

  const [formDataEntries, pipelineLogEntries] = await Promise.all([
    Promise.all(
      solicitantes.map(async (s) => {
        const snapshot = await getFormDataForSolicitante(s.id);
        return [s.id, snapshot] as const;
      }),
    ),
    Promise.all(
      solicitantes.map(async (s) => {
        const logs = await getPipelineLogs(s.id);
        return [s.id, logs] as const;
      }),
    ),
  ]);
  const initialFormData = Object.fromEntries(formDataEntries);
  const initialPipelineLogs = Object.fromEntries(pipelineLogEntries);

  return (
    <SolicitanteListClient
      solicitacao={solicitacao}
      solicitantes={solicitantes}
      shortId={shortId}
      initialShareLink={shareLink ?? null}
      initialApplicantLinks={initialApplicantLinks}
      initialFormData={initialFormData}
      initialPipelineLogs={initialPipelineLogs}
    />
  );
}
