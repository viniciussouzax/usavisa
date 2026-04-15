import "server-only";
import { getPrimaryOrgUidForUser } from "@/shared/models/assessor";
import { getOrganizacaoByUid } from "@/shared/models/organizacao";
import { isMaster } from "@/components/layout/nav-config";

/**
 * Resolve a URL de destino após login para um usuário baseado no seu papel
 * e na sua principal organização (via tabela `assessor`).
 *
 * - Master → lista global de organizações
 * - Usuário com org → `/${shortId}/solicitacoes`
 * - Sem org (conta órfã) → landing pública `/`
 */
export async function resolveHomeUrl(
  userId: string,
  role: string | null | undefined,
): Promise<string> {
  if (isMaster(role)) return "/organizacoes";
  const orgUid = await getPrimaryOrgUidForUser(userId);
  if (!orgUid) return "/";
  const org = await getOrganizacaoByUid(orgUid);
  return org ? `/${org.shortId}/solicitacoes` : "/";
}
