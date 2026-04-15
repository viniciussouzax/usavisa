import type { FieldOption } from "../schema/primitives";

export const RELATIONSHIPS: FieldOption[] = [
  { value: "P", label: "Pai / Mãe" },
  { value: "S", label: "Cônjuge" },
  { value: "C", label: "Filho(a)" },
  { value: "R", label: "Outro parente" },
  { value: "F", label: "Amigo(a)" },
  { value: "B", label: "Parceiro de negócios" },
  { value: "O", label: "Outro" },
];

export const US_CONTACT_RELATIONSHIPS: FieldOption[] = [
  { value: "R", label: "Parente" },
  { value: "S", label: "Cônjuge" },
  { value: "F", label: "Amigo(a)" },
  { value: "B", label: "Sócio(a)" },
  { value: "E", label: "Empregador" },
  { value: "H", label: "Oficial de escola" },
  { value: "O", label: "Outro" },
];

export const RELATIVE_TYPES: FieldOption[] = [
  { value: "S", label: "Cônjuge" },
  { value: "F", label: "Noivo(a)" },
  { value: "C", label: "Filho(a)" },
  { value: "B", label: "Irmão/Irmã" },
];

export const US_STATUS: FieldOption[] = [
  { value: "C", label: "Cidadão americano (USC)" },
  { value: "P", label: "Residente permanente (LPR)" },
  { value: "N", label: "Não-imigrante" },
  { value: "O", label: "Outro / Não sei" },
];

export const OCCUPATIONS: FieldOption[] = [
  { value: "AGRI", label: "Agricultura" },
  { value: "ARTS", label: "Artista / Performer" },
  { value: "BUSN", label: "Negócios" },
  { value: "COMP", label: "Computação" },
  { value: "EDUC", label: "Educação" },
  { value: "ENGR", label: "Engenharia" },
  { value: "GOVT", label: "Governo" },
  { value: "HOME", label: "Do lar" },
  { value: "LEGL", label: "Jurídico" },
  { value: "MEDI", label: "Médico / Saúde" },
  { value: "MILT", label: "Militar" },
  { value: "SCIE", label: "Ciências" },
  { value: "UNEM", label: "Desempregado" },
  { value: "RETI", label: "Aposentado" },
  { value: "STUD", label: "Estudante" },
  { value: "OTHR", label: "Outro" },
];
