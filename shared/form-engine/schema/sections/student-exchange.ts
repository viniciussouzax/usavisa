import type { FormSection } from "../primitives";

const F1J1M1 = ["F1-F1", "J1-J1", "M1"];
const J_DEPS = ["J1-J1", "J2-CH", "J2-SP"];
const F2J2M2 = ["F2-CH", "F2-SP", "J2-CH", "J2-SP", "M2"];

export const studentExchangeSection: FormSection = {
  id: "studentExchange",
  label: "Informações SEVIS",
  showWhen: {
    section: "travel",
    field: "purposeCategory",
    in: ["F", "J", "M"],
  },
  fields: [
    {
      id: "sevisId",
      type: "text",
      label: "Número SEVIS",
      required: true,
      maxLen: 11,
      hint: "Ex: N0123456789",
    },
    {
      id: "programNumber",
      type: "text",
      label: "Número do Programa",
      required: true,
      maxLen: 15,
      showWhen: {
        section: "travel",
        field: "purposeOfTrip",
        in: J_DEPS,
      },
    },
    {
      id: "principalSevisId",
      type: "text",
      label: "SEVIS ID do Requerente Principal",
      required: true,
      maxLen: 11,
      hint: "Informar o SEVIS ID do titular (quando dependente).",
      showWhen: {
        section: "travel",
        field: "purposeOfTrip",
        in: F2J2M2,
      },
    },
    {
      id: "intendToStudy",
      type: "radio",
      label: "Pretende estudar nos EUA?",
      required: true,
      showWhen: {
        section: "travel",
        field: "purposeOfTrip",
        equals: "J1-J1",
      },
    },
    {
      id: "schoolName",
      type: "text",
      label: "Nome da Escola",
      required: true,
      maxLen: 75,
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "courseOfStudy",
      type: "text",
      label: "Curso de Estudo",
      required: true,
      maxLen: 66,
      hint: "Para high school usar \"Academic\" ou \"Vocational\".",
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "schoolAddress",
      type: "text",
      label: "Endereço da Instituição — Linha 1",
      required: true,
      maxLen: 40,
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "schoolAddress2",
      type: "text",
      label: "Endereço da Instituição — Linha 2",
      maxLen: 40,
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "schoolCity",
      type: "text",
      label: "Cidade da Instituição",
      required: true,
      maxLen: 20,
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "schoolState",
      type: "select",
      label: "Estado",
      required: true,
      optionsRef: "usStates",
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
    {
      id: "schoolZip",
      type: "text",
      label: "CEP (ZIP Code)",
      required: true,
      maxLen: 10,
      showWhen: { section: "travel", field: "purposeOfTrip", in: F1J1M1 },
    },
  ],
};
