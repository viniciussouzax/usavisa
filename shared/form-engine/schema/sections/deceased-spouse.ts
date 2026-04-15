import type { FormSection } from "../primitives";

export const deceasedSpouseSection: FormSection = {
  id: "deceasedSpouse",
  label: "Cônjuge Falecido",
  showWhen: {
    section: "personal1",
    field: "maritalStatus",
    equals: "W",
  },
  fields: [
    {
      id: "surname",
      type: "text",
      label: "Sobrenome",
      required: true,
      maxLen: 33,
      noSpecial: true,
    },
    {
      id: "givenName",
      type: "text",
      label: "Nome",
      required: true,
      maxLen: 33,
      noSpecial: true,
    },
    {
      id: "dob",
      type: "date",
      label: "Data de Nascimento",
      required: true,
      notFuture: true,
    },
    {
      id: "nationality",
      type: "select",
      label: "Nacionalidade",
      required: true,
      optionsRef: "countries",
    },
    {
      id: "cityOfBirth",
      type: "text",
      label: "Cidade de Nascimento",
      required: true,
      maxLen: 20,
      allowUnknown: true,
    },
    {
      id: "countryOfBirth",
      type: "select",
      label: "País de Nascimento",
      required: true,
      optionsRef: "countries",
    },
  ],
};
