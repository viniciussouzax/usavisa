export const APIFY_STAGES = [
  { slug: "ceac-ds160", label: "CEAC - DS-160", hint: "ex: weathered_quake/ceac-ds160" },
  { slug: "ceac-status-check", label: "CEAC - Status Check" },
  { slug: "ais-cadastro-taxa", label: "AIS - Cadastro e Taxa" },
  { slug: "ais-monitoramento", label: "AIS - Monitoramento" },
  { slug: "ais-agendamento", label: "AIS - Agendamento" },
  { slug: "ais-antecipacao", label: "AIS - Antecipacao" },
] as const;

export type ApifyStageSlug = (typeof APIFY_STAGES)[number]["slug"];

export function actorIdKey(slug: ApifyStageSlug): string {
  return `actor_${slug.replace(/-/g, "_")}`;
}
