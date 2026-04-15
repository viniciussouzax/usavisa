import type { FormSection } from "../primitives";

export const additionalInfoSection: FormSection = {
  id: "additionalInfo",
  label: "Informações Adicionais do Caso",
  fields: [
    {
      id: "_additionalInfoIntro",
      type: "orientation",
      text:
        "Campo interno da plataforma — não é enviado ao CEAC. Use pra comunicar ao assessor contexto, histórico ou situações que não cabem no DS-160.",
    },
    {
      id: "caseNotes",
      type: "textarea",
      label: "Informações adicionais sobre o seu caso",
      maxLen: 4000,
      hint: "Texto livre. Descreva qualquer detalhe relevante.",
    },
    {
      id: "sensitiveFlags",
      type: "radio",
      label: "Possui alguma situação sensível que exige atenção?",
      options: [
        { value: "S", label: "Sim" },
        { value: "N", label: "Não" },
      ],
    },
    {
      id: "sensitiveDetails",
      type: "textarea",
      label: "Descreva a situação sensível",
      maxLen: 4000,
      showWhen: { field: "sensitiveFlags", equals: "S" },
    },
  ],
};
