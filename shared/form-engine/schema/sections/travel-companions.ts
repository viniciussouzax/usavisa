import type { FormSection } from "../primitives";

export const travelCompanionsSection: FormSection = {
  id: "travelCompanions",
  label: "Acompanhantes de Viagem",
  fields: [
    {
      id: "travelingWithOthers",
      type: "radio",
      label: "Viaja com outras pessoas?",
      required: true,
      hint: "Inclui familiares, amigos e qualquer acompanhante.",
      ds160: "rblOtherPersonsTravelingWithYou",
    },
    {
      id: "partOfGroup",
      type: "radio",
      label: "Faz parte de um grupo?",
      required: true,
      showWhen: { field: "travelingWithOthers", equals: "Y" },
      ds160: "rblGroupTravel",
    },
    {
      id: "groupName",
      type: "text",
      label: "Nome do grupo",
      required: true,
      maxLen: 40,
      showWhen: { field: "partOfGroup", equals: "Y" },
      ds160: "tbxGroupName",
    },
    {
      id: "companions",
      type: "array",
      label: "Acompanhantes",
      maxItems: 5,
      showWhen: { field: "partOfGroup", equals: "N" },
      ds160List: "dlTravelCompanions",
      fields: [
        {
          id: "givenName",
          type: "text",
          label: "Nome",
          required: true,
          maxLen: 33,
          noSpecial: true,
        },
        {
          id: "surname",
          type: "text",
          label: "Sobrenome",
          required: true,
          maxLen: 33,
          noSpecial: true,
        },
        {
          id: "relationship",
          type: "select",
          label: "Relação",
          required: true,
          optionsRef: "relationships",
        },
      ],
    },
  ],
};
