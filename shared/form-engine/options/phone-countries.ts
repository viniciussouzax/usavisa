export type PhoneCountry = { code: string; dial: string; label: string };

/**
 * DDIs suportados inicialmente. Lista curta — expandir quando necessário.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "br", dial: "+55", label: "Brasil (+55)" },
  { code: "us", dial: "+1", label: "EUA / Canadá (+1)" },
  { code: "ar", dial: "+54", label: "Argentina (+54)" },
  { code: "cl", dial: "+56", label: "Chile (+56)" },
  { code: "mx", dial: "+52", label: "México (+52)" },
  { code: "uk", dial: "+44", label: "Reino Unido (+44)" },
  { code: "pt", dial: "+351", label: "Portugal (+351)" },
  { code: "es", dial: "+34", label: "Espanha (+34)" },
  { code: "fr", dial: "+33", label: "França (+33)" },
  { code: "it", dial: "+39", label: "Itália (+39)" },
  { code: "de", dial: "+49", label: "Alemanha (+49)" },
  { code: "jp", dial: "+81", label: "Japão (+81)" },
];

export function phoneCountryByCode(code?: string): PhoneCountry {
  return PHONE_COUNTRIES.find((p) => p.code === code) ?? PHONE_COUNTRIES[0];
}
