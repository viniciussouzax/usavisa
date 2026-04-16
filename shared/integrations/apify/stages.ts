// Catálogo canônico das etapas que têm (ou virão a ter) um actor Apify dedicado.
// Cada etapa ganha um slot na integração "apify" onde o master cola o ID do actor
// responsável. O dispatcher resolve stage → actorId na hora de disparar um run.

export const APIFY_STAGES = [
  { slug: "ceac-ds160", label: "CEAC — DS-160", hint: "ex: weathered_quake~ds160v2" },
  { slug: "ceac-status-check", label: "CEAC — Status Check" },
  { slug: "ais-cadastro-taxa", label: "AIS — Cadastro e Taxa" },
  { slug: "ais-monitoramento", label: "AIS — Monitoramento" },
  { slug: "ais-agendamento", label: "AIS — Agendamento" },
  { slug: "ais-antecipacao", label: "AIS — Antecipação" },
] as const;

export type ApifyStageSlug = (typeof APIFY_STAGES)[number]["slug"];

// Chave usada em `globalIntegration.config` (Record<string, string>). Prefixo
// `actor_` isola dos demais campos da integração (ex: apiToken).
export function actorIdKey(slug: ApifyStageSlug): string {
  return `actor_${slug.replace(/-/g, "_")}`;
}
