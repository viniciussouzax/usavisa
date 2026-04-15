/**
 * Pipeline de sanitização aplicada a todo input de texto durante digitação:
 *   strip acentos → normalizar aspas → uppercase (exceto email/senha).
 * Ordem importa — ver spec/frontend/formulario/engine.md#4.
 */

const QUOTE_MAP: Record<string, string> = {
  "“": '"',
  "”": '"',
  "„": '"',
  "«": '"',
  "»": '"',
  "‘": "'",
  "’": "'",
  "‚": "'",
};

export function stripAccents(s: string): string {
  // Normalize decomposes chars like "é" → "e" + combining accent, then we
  // drop combining marks (U+0300–U+036F).
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeQuotes(s: string): string {
  return s.replace(/[\u201C\u201D\u201E\u00AB\u00BB\u2018\u2019\u201A]/g, (m) => QUOTE_MAP[m] ?? m);
}

/**
 * Aplica sanitização padrão. skipUppercase = true pra email/senha.
 */
export function sanitizeText(
  s: string,
  opts: { skipUppercase?: boolean } = {},
): string {
  let out = stripAccents(s);
  out = normalizeQuotes(out);
  if (!opts.skipUppercase) out = out.toUpperCase();
  return out;
}

/** Remove qualquer caractere não-alfanumérico + espaços + hífens. */
export function removeSpecialChars(s: string): string {
  return s.replace(/[^A-Z0-9\s\-]/gi, "");
}
