import type { FormSection } from "../primitives";

const CASV_LOCATIONS = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "BH", label: "Belo Horizonte" },
  { value: "BSB", label: "Brasília" },
];

export const aisInfoSection: FormSection = {
  id: "aisInfo",
  label: "AIS e Agendamento",
  fields: [
    {
      id: "_aisIntro",
      type: "orientation",
      text:
        "Informações usadas pela assessoria pra agendar CASV (biometria) e entrevista consular. Seção interna — não é enviada ao DS-160.",
    },

    // Bloco 1 — Credenciais AIS
    { id: "_aisCredHeading", type: "heading", label: "Credenciais do portal AIS" },
    {
      id: "hasAisAccount",
      type: "radio",
      label: "Já possui conta no portal AIS (usvisa-info.com)?",
      required: true,
    },
    {
      id: "aisEmail",
      type: "email",
      label: "Email da conta AIS",
      required: true,
      maxLen: 50,
      showWhen: { field: "hasAisAccount", equals: "Y" },
    },
    {
      id: "aisPassword",
      type: "text",
      label: "Senha da conta AIS",
      required: true,
      maxLen: 64,
      showWhen: { field: "hasAisAccount", equals: "Y" },
      hint: "A senha é armazenada com segurança e usada apenas pelo agendador.",
    },
    {
      id: "newAccountEmail",
      type: "email",
      label: "Email para criar nova conta",
      maxLen: 50,
      allowNA: true,
      showWhen: { field: "hasAisAccount", equals: "N" },
      hint: "Opcional. Se em branco, o sistema gera um email automático.",
    },

    // Bloco 2 — CASV (oculto pra PTA/RCF)
    {
      id: "_casvHeading",
      type: "heading",
      label: "Agendamento CASV (biometria)",
      showWhen: { section: "location", field: "location", notIn: ["PTA", "RCF"] },
    },
    {
      id: "_casvOrientation",
      type: "orientation",
      text:
        "Seu consulado de entrevista exige agendamento separado para coleta de biometria (CASV). Informe o posto mais próximo e as datas em que pode comparecer.",
      showWhen: { section: "location", field: "location", notIn: ["PTA", "RCF"] },
    },
    {
      id: "casvLocation",
      type: "select",
      label: "Local do CASV",
      required: true,
      options: CASV_LOCATIONS,
      hint: "Escolha o posto mais próximo de você.",
      showWhen: { section: "location", field: "location", notIn: ["PTA", "RCF"] },
    },
    {
      id: "casvAvailability",
      type: "daterange",
      label: "Quando pode ir ao CASV?",
      required: true,
      notPast: true,
      hint: "Intervalo de datas em que você está disponível para biometria.",
      showWhen: { section: "location", field: "location", notIn: ["PTA", "RCF"] },
    },
    {
      id: "casvAvailabilityAlt",
      type: "daterange",
      label: "Período alternativo para CASV",
      allowNA: true,
      notPast: true,
      hint: "Opcional — segundo período caso o primeiro não tenha vagas.",
      showWhen: { section: "location", field: "location", notIn: ["PTA", "RCF"] },
    },

    // Bloco 3 — Entrevista (sempre visível)
    { id: "_interviewHeading", type: "heading", label: "Agendamento da entrevista consular" },
    {
      id: "interviewAvailability",
      type: "daterange",
      label: "Quando pode ir à entrevista?",
      required: true,
      notPast: true,
      hint: "Intervalo em que você está disponível para a entrevista no consulado.",
    },
    {
      id: "interviewAvailabilityAlt",
      type: "daterange",
      label: "Período alternativo para a entrevista",
      allowNA: true,
      notPast: true,
      hint: "Opcional — segundo período.",
    },
  ],
};
