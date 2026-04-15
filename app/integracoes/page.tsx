import { listGlobalIntegrations } from "@/shared/models/integration";
import { IntegracoesClient } from "./components/integracoes-client";

export default async function IntegracoesPage() {
  const integracoes = await listGlobalIntegrations();
  return <IntegracoesClient integracoes={integracoes} />;
}
