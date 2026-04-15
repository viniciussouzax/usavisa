import {
  countAssessoresByOrg,
  countSolicitacoesByOrg,
  listOrganizacoes,
} from "@/shared/models/organizacao";
import { OrganizacoesClient } from "./components/organizacoes-client";

export default async function OrganizacoesPage() {
  const orgs = await listOrganizacoes();
  const organizacoes = await Promise.all(
    orgs.map(async (org) => ({
      ...org,
      assessoresCount: await countAssessoresByOrg(org.uid),
      solicitacoesCount: await countSolicitacoesByOrg(org.uid),
    })),
  );

  return <OrganizacoesClient organizacoes={organizacoes} />;
}
