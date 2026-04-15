import type { FormSection } from "../primitives";

export const temporaryWorkSection: FormSection = {
  id: "temporaryWork",
  label: "Informações de Trabalho Temporário",
  showWhen: {
    section: "travel",
    field: "purposeCategory",
    in: ["H", "L", "O", "P", "Q", "R"],
  },
  fields: [
    {
      id: "petitionNumber",
      type: "text",
      label: "Número do Recibo / Petição",
      required: true,
      maxLen: 13,
      hint: "Ex: ABC1234567890",
    },
    {
      id: "nameOfPetitioner",
      type: "text",
      label: "Nome da Pessoa / Empresa da Petição",
      required: true,
      maxLen: 66,
    },
    {
      id: "employerName",
      type: "text",
      label: "Nome do Empregador",
      required: true,
      maxLen: 75,
    },
    {
      id: "employerAddress",
      type: "text",
      label: "Endereço nos EUA — Linha 1",
      required: true,
      maxLen: 40,
    },
    {
      id: "employerAddress2",
      type: "text",
      label: "Endereço nos EUA — Linha 2",
      maxLen: 40,
    },
    {
      id: "employerCity",
      type: "text",
      label: "Cidade",
      required: true,
      maxLen: 20,
    },
    {
      id: "employerState",
      type: "select",
      label: "Estado",
      required: true,
      optionsRef: "usStates",
    },
    {
      id: "employerZip",
      type: "text",
      label: "CEP (ZIP Code)",
      maxLen: 10,
    },
    {
      id: "employerPhone",
      type: "text",
      label: "Telefone",
      required: true,
      maxLen: 15,
    },
    {
      id: "monthlySalary",
      type: "text",
      label: "Renda Mensal (USD)",
      required: true,
      maxLen: 11,
    },
  ],
};
