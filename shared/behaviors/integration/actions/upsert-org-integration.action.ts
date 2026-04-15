"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { upsertOrgIntegration } from "@/shared/models/integration";
import { getOrganizacaoByUid } from "@/shared/models/organizacao";

const schema = z.object({
  organizacaoUid: z.string().min(1),
  integrationId: z.string().min(1),
  config: z.record(z.string(), z.string()),
  ativo: z.boolean(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function upsertOrgIntegrationAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const org = await getOrganizacaoByUid(parsed.data.organizacaoUid);
  if (!org) return { error: "Organização não encontrada" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, org.uid);
    if (!m?.ativo) return { error: "Sem permissão" };
  }

  await upsertOrgIntegration({
    organizacaoUid: parsed.data.organizacaoUid,
    integrationId: parsed.data.integrationId,
    config: parsed.data.config,
    ativo: parsed.data.ativo,
  });
  return { error: null };
}
