import type { FormSection } from "../primitives";

export const studentAddContactSection: FormSection = {
  id: "studentAddContact",
  label: "Contatos Adicionais (Estudante)",
  showWhen: {
    section: "travel",
    field: "purposeOfTrip",
    in: ["F1-F1", "J1-J1", "M1"],
  },
  fields: [
    {
      id: "studentAddContactNote",
      type: "alert",
      alertStyle: "info",
      text:
        "O CEAC exige no mínimo 2 contatos aqui — não podem ser familiares imediatos ou parentes. Ex: amigos, professores, colegas.",
    },
    {
      id: "contacts",
      type: "array",
      label: "Contatos",
      required: true,
      minEntries: 2,
      maxItems: 5,
      fields: [
        { id: "surname", type: "text", label: "Sobrenome", required: true, maxLen: 33 },
        { id: "givenName", type: "text", label: "Nome", required: true, maxLen: 33 },
        {
          id: "address1",
          type: "text",
          label: "Endereço — Linha 1",
          required: true,
          maxLen: 40,
        },
        { id: "address2", type: "text", label: "Endereço — Linha 2", maxLen: 40 },
        { id: "city", type: "text", label: "Cidade", required: true, maxLen: 20 },
        {
          id: "state",
          type: "text",
          label: "Estado / Província",
          maxLen: 20,
          allowNA: true,
        },
        {
          id: "postalCode",
          type: "text",
          label: "CEP / Código Postal",
          maxLen: 10,
          allowNA: true,
        },
        {
          id: "country",
          type: "select",
          label: "País",
          required: true,
          optionsRef: "countries",
        },
        { id: "phone", type: "phone", label: "Telefone", allowNA: true },
        {
          id: "email",
          type: "email",
          label: "E-mail",
          maxLen: 50,
          allowNA: true,
        },
      ],
    },
  ],
};
