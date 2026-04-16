import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { globalIntegration } from "@/db/schema";
import { actorIdKey, type ApifyStageSlug } from "@/shared/integrations/apify/stages";

export type Ds160Credentials = {
  capmonsterApiKey: string;
  apify: {
    apiToken: string;
    actorId: string;
  };
};

export async function getDs160Credentials(opts: { stage: ApifyStageSlug }): Promise<Ds160Credentials> {
  const rows = await db.select().from(globalIntegration);
  const byId = new Map(rows.map((r) => [r.integrationId, r]));

  const cap = byId.get("capmonster");
  const apify = byId.get("apify");

  if (!cap?.ativo) throw new Error("CapMonster não conectado em /integracoes");
  const capmonsterApiKey = (cap.config as Record<string, string>)?.apiKey;
  if (!capmonsterApiKey) throw new Error("CapMonster sem API Key em /integracoes");

  if (!apify?.ativo) throw new Error("Apify não conectado em /integracoes");
  const apifyConfig = (apify.config as Record<string, string>) ?? {};
  const apiToken = apifyConfig.apiToken;
  if (!apiToken) throw new Error("Apify sem API Token em /integracoes");

  const actorId = apifyConfig[actorIdKey(opts.stage)];
  if (!actorId) {
    throw new Error(`Apify sem actor configurado para a etapa "${opts.stage}" em /integracoes`);
  }

  return {
    capmonsterApiKey,
    apify: { apiToken, actorId },
  };
}
