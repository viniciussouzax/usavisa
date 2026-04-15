import type {
  ArrayField,
  DateValue,
  FormField,
  FormSection,
  SsnValue,
} from "../schema/primitives";
import { NA_MARKER, UNKNOWN_MARKER, isArrayField, isDisplayOnly } from "../schema/primitives";
import { isFieldVisible, isSectionVisible } from "./conditional";

export type FieldError = {
  key: string;
  message: string;
};

type ValidationContext = {
  data: Record<string, unknown>;
  arrayData: Record<string, unknown[]>;
  naFields: Set<string>;
  unknownFields: Set<string>;
};

function isDateFilled(v: unknown): v is DateValue {
  return (
    typeof v === "object" &&
    v !== null &&
    "day" in v &&
    "month" in v &&
    "year" in v &&
    Boolean((v as DateValue).day) &&
    Boolean((v as DateValue).month) &&
    (v as DateValue).year.length === 4
  );
}

function isSsnFilled(v: unknown): v is SsnValue {
  return (
    typeof v === "object" &&
    v !== null &&
    "p1" in v &&
    "p2" in v &&
    "p3" in v &&
    Boolean((v as SsnValue).p1) &&
    Boolean((v as SsnValue).p2) &&
    Boolean((v as SsnValue).p3)
  );
}

function hasMarker(key: string, ctx: ValidationContext): boolean {
  return ctx.naFields.has(key) || ctx.unknownFields.has(key);
}

function isFieldFilled(
  field: FormField,
  value: unknown,
): boolean {
  if (field.type === "date") return isDateFilled(value);
  if (field.type === "ssn") return isSsnFilled(value);
  if (typeof value === "string") return value.trim() !== "";
  return value !== undefined && value !== null;
}

function validateAtomic(
  field: FormField,
  sectionId: string,
  ctx: ValidationContext,
  arrayScope?: { arrayKey: string; index: number },
): FieldError[] {
  if (isDisplayOnly(field)) return [];

  const canonicalKey = arrayScope
    ? `${arrayScope.arrayKey}[${arrayScope.index}].${field.id}`
    : `${sectionId}.${field.id}`;

  if (hasMarker(canonicalKey, ctx)) return [];

  const value = arrayScope
    ? (ctx.arrayData[arrayScope.arrayKey]?.[arrayScope.index] as
        | Record<string, unknown>
        | undefined)?.[field.id]
    : ctx.data[canonicalKey];

  if (field.type === "date" && field.notFuture && isDateFilled(value)) {
    const y = Number(value.year);
    const m =
      ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(value.month);
    const d = Number(value.day);
    if (!Number.isNaN(y) && m >= 0 && !Number.isNaN(d)) {
      const dt = new Date(y, m, d);
      if (dt.getTime() > Date.now()) {
        return [{ key: canonicalKey, message: "Data não pode ser futura." }];
      }
    }
  }

  if (field.type === "email" && typeof value === "string" && value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return [{ key: canonicalKey, message: "Email inválido." }];
    }
  }

  if ("required" in field && field.required && !isFieldFilled(field, value)) {
    return [{ key: canonicalKey, message: "Campo obrigatório." }];
  }
  return [];
}

function validateArray(
  field: ArrayField,
  sectionId: string,
  ctx: ValidationContext,
): FieldError[] {
  const arrayKey = `${sectionId}.${field.id}`;
  const rows = ctx.arrayData[arrayKey] ?? [];
  const errors: FieldError[] = [];

  if (field.required && rows.length === 0) {
    errors.push({ key: arrayKey, message: "Adicione pelo menos uma entrada." });
  }

  rows.forEach((_, idx) => {
    for (const sub of field.fields) {
      errors.push(
        ...validateAtomic(sub, sectionId, ctx, {
          arrayKey,
          index: idx,
        }),
      );
    }
  });

  return errors;
}

export function validateSection(
  section: FormSection,
  ctx: ValidationContext,
): FieldError[] {
  if (!isSectionVisible(section, ctx)) return [];
  const errors: FieldError[] = [];
  for (const field of section.fields) {
    if (!isFieldVisible(field, ctx, section.id)) continue;
    if (isDisplayOnly(field)) continue;
    if (isArrayField(field)) {
      errors.push(...validateArray(field, section.id, ctx));
    } else {
      errors.push(...validateAtomic(field, section.id, ctx));
    }
  }
  return errors;
}

export function validateAll(
  sections: FormSection[],
  ctx: ValidationContext,
): Map<string, FieldError[]> {
  const map = new Map<string, FieldError[]>();
  for (const section of sections) {
    map.set(section.id, validateSection(section, ctx));
  }
  return map;
}

/**
 * Export pra referências externas — engine preserva esses marcadores.
 */
export const MARKER_NA = NA_MARKER;
export const MARKER_UNKNOWN = UNKNOWN_MARKER;
