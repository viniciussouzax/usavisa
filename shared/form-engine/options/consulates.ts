import type { FieldOption } from "../schema/primitives";

/**
 * Lista de postos consulares onde o DS-160 pode ser submetido. Brasil no
 * topo por ordem alfabética das cidades, outros países no final.
 * Códigos batem com `ddlLocation` do CEAC.
 */
export const CONSULATES: FieldOption[] = [
  // Brasil (topo)
  { value: "BRA", label: "Brasília, Brasil" },
  { value: "PTA", label: "Porto Alegre, Brasil" },
  { value: "RCF", label: "Recife, Brasil" },
  { value: "RDJ", label: "Rio de Janeiro, Brasil" },
  { value: "SPL", label: "São Paulo, Brasil" },
  // Outros países (subset inicial)
  { value: "BNS", label: "Buenos Aires, Argentina" },
  { value: "MTV", label: "Montevidéu, Uruguai" },
  { value: "STG", label: "Santiago, Chile" },
  { value: "LMA", label: "Lima, Peru" },
  { value: "BGA", label: "Bogotá, Colômbia" },
  { value: "MXC", label: "Cidade do México, México" },
  { value: "OTT", label: "Ottawa, Canadá" },
  { value: "LON", label: "Londres, Reino Unido" },
  { value: "MAD", label: "Madri, Espanha" },
  { value: "LIS", label: "Lisboa, Portugal" },
  { value: "PRS", label: "Paris, França" },
  { value: "RME", label: "Roma, Itália" },
  { value: "TKY", label: "Tóquio, Japão" },
];
