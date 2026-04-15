import type { FieldOption } from "../schema/primitives";

/**
 * Subset inicial dos países reconhecidos pelo CEAC. Brasil no topo. A lista
 * completa (~200 entradas) virá na Fase 5.9 (seções que exigem).
 * Códigos seguem o padrão de 4 letras do CEAC.
 */
export const COUNTRIES: FieldOption[] = [
  { value: "BRZL", label: "Brasil" },
  { value: "USA", label: "Estados Unidos" },
  { value: "ARG", label: "Argentina" },
  { value: "CAN", label: "Canadá" },
  { value: "CHIL", label: "Chile" },
  { value: "CHIN", label: "China" },
  { value: "COL", label: "Colômbia" },
  { value: "FRAN", label: "França" },
  { value: "GER", label: "Alemanha" },
  { value: "ITLY", label: "Itália" },
  { value: "JPN", label: "Japão" },
  { value: "MEX", label: "México" },
  { value: "PER", label: "Peru" },
  { value: "PORT", label: "Portugal" },
  { value: "SPN", label: "Espanha" },
  { value: "SZLD", label: "Suíça" },
  { value: "UKM", label: "Reino Unido" },
  { value: "URU", label: "Uruguai" },
];
