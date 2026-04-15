import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { listPublicLinksByOrg } from "@/shared/models/org-public-link";
import { HotpageEditor } from "./components/hotpage-editor";

export default async function PaginaPublicaConfigPage({
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

  const links = await listPublicLinksByOrg(org.uid);

  return (
    <HotpageEditor
      shortId={shortId}
      initialOrg={{
        tagline: org.tagline,
        descricao: org.descricao,
        footerText: org.footerText,
      }}
      initialLinks={links}
    />
  );
}
