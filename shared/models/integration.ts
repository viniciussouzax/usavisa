import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { globalIntegration, orgIntegration } from "@/db/schema";
import {
  GLOBAL_INTEGRATION_CATALOG,
  ORG_INTEGRATION_CATALOG,
  type Integracao,
} from "@/app/data";

/**
 * Mescla catálogo (schema de campos) com o estado persistido (conectado + config).
 */
export async function listGlobalIntegrations(): Promise<Integracao[]> {
  const rows = await db.select().from(globalIntegration);
  const byId = new Map(rows.map((r) => [r.integrationId, r]));
  return GLOBAL_INTEGRATION_CATALOG.map((cat) => {
    const row = byId.get(cat.id);
    return {
      ...cat,
      conectado: row?.ativo ?? false,
      config: row?.config ?? {},
    };
  });
}

export async function listOrgIntegrations(
  organizacaoUid: string,
): Promise<Integracao[]> {
  const rows = await db
    .select()
    .from(orgIntegration)
    .where(eq(orgIntegration.organizacaoUid, organizacaoUid));
  const byId = new Map(rows.map((r) => [r.integrationId, r]));
  return ORG_INTEGRATION_CATALOG.map((cat) => {
    const row = byId.get(cat.id);
    return {
      ...cat,
      conectado: row?.ativo ?? false,
      config: row?.config ?? {},
    };
  });
}

export async function upsertOrgIntegration(input: {
  organizacaoUid: string;
  integrationId: string;
  config: Record<string, string>;
  ativo: boolean;
}): Promise<void> {
  const existing = await db
    .select({ id: orgIntegration.id })
    .from(orgIntegration)
    .where(eq(orgIntegration.organizacaoUid, input.organizacaoUid))
    .limit(1);
  if (existing.length) {
    await db
      .update(orgIntegration)
      .set({
        config: input.config,
        ativo: input.ativo,
        updatedAt: new Date(),
      })
      .where(eq(orgIntegration.id, existing[0].id));
    return;
  }
  await db.insert(orgIntegration).values({
    id: crypto.randomUUID(),
    organizacaoUid: input.organizacaoUid,
    integrationId: input.integrationId,
    config: input.config,
    ativo: input.ativo,
  });
}

export async function upsertGlobalIntegration(input: {
  integrationId: string;
  config: Record<string, string>;
  ativo: boolean;
}): Promise<void> {
  const existing = await db
    .select({ integrationId: globalIntegration.integrationId })
    .from(globalIntegration)
    .where(eq(globalIntegration.integrationId, input.integrationId))
    .limit(1);
  if (existing.length) {
    await db
      .update(globalIntegration)
      .set({
        config: input.config,
        ativo: input.ativo,
        updatedAt: new Date(),
      })
      .where(eq(globalIntegration.integrationId, input.integrationId));
    return;
  }
  await db.insert(globalIntegration).values({
    integrationId: input.integrationId,
    config: input.config,
    ativo: input.ativo,
  });
}
