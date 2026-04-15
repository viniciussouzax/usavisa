"use client";

/**
 * Curadoria de fontes do Google Fonts disponíveis para white-label.
 * Top picks por estilo. Se precisar adicionar, confira disponibilidade em
 * https://fonts.google.com.
 */
export const GOOGLE_FONTS = [
  // Sans-serif (modern, clean)
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Nunito",
  "Raleway",
  "Work Sans",
  "DM Sans",
  "Plus Jakarta Sans",
  "Figtree",
  "Outfit",
  "Space Grotesk",
  "Manrope",
  "Sora",
  "Noto Sans",
  "Rubik",

  // Serif (classic, elegant)
  "Playfair Display",
  "Merriweather",
  "Lora",
  "PT Serif",
  "EB Garamond",
  "Cormorant Garamond",
  "Bitter",
  "DM Serif Display",
  "Libre Baskerville",
  "Crimson Text",

  // Mono
  "JetBrains Mono",
  "Fira Code",
  "IBM Plex Mono",
  "Space Mono",

  // Display
  "Bebas Neue",
  "Oswald",
  "Archivo Black",
  "Anton",
  "Righteous",

  // Handwriting
  "Caveat",
  "Dancing Script",
  "Pacifico",
] as const;

export type GoogleFont = (typeof GOOGLE_FONTS)[number];

/**
 * Injeta (ou atualiza) um <link> com todas as famílias passadas.
 * Idempotente: chamadas repetidas com as mesmas famílias são no-op.
 * No-op em SSR.
 */
const LOADED = new Set<string>();
let linkEl: HTMLLinkElement | null = null;

export function loadGoogleFonts(families: string[]) {
  if (typeof window === "undefined") return;

  const novel = families.filter((f) => f && !LOADED.has(f));
  if (novel.length === 0) return;

  novel.forEach((f) => LOADED.add(f));

  const params = Array.from(LOADED)
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  const url = `https://fonts.googleapis.com/css2?${params}&display=swap`;

  if (!linkEl) {
    linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    document.head.appendChild(linkEl);
  }
  linkEl.href = url;
}
