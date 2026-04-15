import type { FormSection } from "../primitives";
import { CONSULATES } from "../../options/consulates";

export const locationSection: FormSection = {
  id: "location",
  label: "Local da Entrevista",
  fields: [
    {
      id: "location",
      type: "select",
      label: "Local da entrevista",
      required: true,
      options: CONSULATES,
      ds160: "ddlLocation",
    },
    {
      id: "locationPhotoWarning",
      type: "alert",
      alertStyle: "warning",
      text:
        "Os postos consulares de Porto Alegre e Recife exigem foto digital de alta resolução. Prepare a foto conforme as orientações antes da entrevista.",
      showWhen: { field: "location", in: ["PTA", "RCF"] },
    },
  ],
};
