import type { FormSection } from "../primitives";

export const photoSection: FormSection = {
  id: "photo",
  label: "Foto do Solicitante",
  fields: [
    {
      id: "_photoIntro",
      type: "orientation",
      text:
        "Foto no padrão CEAC: JPG, até 240 KB, dimensões mínimas 600×600 px, fundo branco, rosto centralizado sem óculos, expressão neutra.",
    },
    {
      id: "photo",
      type: "file",
      label: "Foto do Solicitante",
      required: true,
      accept: "image/jpeg",
      maxSizeMb: 0.24,
      hint: "JPG até 240 KB.",
    },
  ],
};
