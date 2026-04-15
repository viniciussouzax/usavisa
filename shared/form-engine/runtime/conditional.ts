import type {
  DateValue,
  FormField,
  FormSection,
  ShowWhen,
} from "../schema/primitives";

type StateLike = {
  data: Record<string, unknown>;
  arrayData: Record<string, unknown[]>;
  unknownFields: Set<string>;
};

export type ArrayScope = { arrayKey: string; index: number };

function resolveRefValue(
  state: StateLike,
  cond: ShowWhen,
  currentSectionId: string,
  arrayScope?: ArrayScope,
): string | undefined {
  // Se showWhen tem `section` explícita, sempre busca em data global.
  // Caso contrário, e estivermos dentro de um array row, busca na MESMA row.
  if (!cond.section && arrayScope) {
    const row =
      (state.arrayData[arrayScope.arrayKey] as Record<string, unknown>[] | undefined)?.[
        arrayScope.index
      ];
    const v = row?.[cond.field];
    if (typeof v === "string") return v;
  }
  const section = cond.section ?? currentSectionId;
  const key = `${section}.${cond.field}`;
  const v = state.data[key];
  return typeof v === "string" ? v : undefined;
}

export function evaluateShowWhen(
  cond: ShowWhen | undefined,
  state: StateLike,
  currentSectionId: string,
  arrayScope?: ArrayScope,
): boolean {
  if (!cond) return true;
  const v = resolveRefValue(state, cond, currentSectionId, arrayScope);
  if ("equals" in cond) return v === cond.equals;
  if ("in" in cond) return v !== undefined && cond.in.includes(v);
  if ("notIn" in cond) return v === undefined || !cond.notIn.includes(v);
  return true;
}

export function isFieldVisible(
  field: FormField,
  state: StateLike,
  sectionId: string,
  arrayScope?: ArrayScope,
): boolean {
  if (!evaluateShowWhen(field.showWhen, state, sectionId, arrayScope)) {
    return false;
  }
  // hideWhenAllUnknown: oculta se TODOS os campos referenciados estão
  // marcados como UNKNOWN. Se a lista estiver vazia, não oculta.
  if (field.hideWhenAllUnknown && field.hideWhenAllUnknown.length > 0) {
    const allUnknown = field.hideWhenAllUnknown.every((refId) => {
      const canonical = arrayScope
        ? `${arrayScope.arrayKey}[${arrayScope.index}].${refId}`
        : `${sectionId}.${refId}`;
      return state.unknownFields.has(canonical);
    });
    if (allUnknown) return false;
  }
  return true;
}

const MONTH_ORDER = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/**
 * Retorna true se personal1.dob indica solicitante com menos de 14 anos
 * na data atual. Se dob estiver incompleto/inválido, retorna false (não
 * oculta — na dúvida mostra).
 */
export function isMinor(state: StateLike): boolean {
  const dob = state.data["personal1.dob"];
  if (
    typeof dob !== "object" ||
    dob === null ||
    !("day" in dob) ||
    !("month" in dob) ||
    !("year" in dob)
  ) {
    return false;
  }
  const v = dob as DateValue;
  const y = Number(v.year);
  const m = MONTH_ORDER.indexOf(v.month);
  const d = Number(v.day);
  if (!Number.isFinite(y) || m < 0 || !Number.isFinite(d)) return false;
  const now = new Date();
  let age = now.getFullYear() - y;
  const monthDiff = now.getMonth() - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) age--;
  return age < 14;
}

export function isSectionVisible(
  section: FormSection,
  state: StateLike,
): boolean {
  if (section.hideWhenMinor && isMinor(state)) return false;
  return evaluateShowWhen(section.showWhen, state, section.id);
}
