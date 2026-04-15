/**
 * Contrato declarativo do DS-160 Form Engine. Cada uma das 23 seções exporta
 * um FormSection usando estes primitivos. Ver spec/frontend/formulario/.
 *
 * REGRAS DE OURO:
 *   - Primitivos NÃO contêm lógica de UI; o renderer interpreta e o engine
 *     aplica comportamento (prune-on-hide, showWhen, validação).
 *   - IDs são "secId.fieldId". Sub-campos de array: "secId.arrayId[idx].subId".
 *   - Não adicione um tipo novo sem confirmar com input_patterns.md.
 */

// -- Tipos dos valores persistidos ------------------------------------------

export type DateValue = { day: string; month: string; year: string };
export type SsnValue = { p1: string; p2: string; p3: string };
export type DateRangeValue = { from: DateValue; to: DateValue };
export type ArrayRow = Record<string, FieldValue>;
export type FieldValue =
  | string
  | DateValue
  | DateRangeValue
  | SsnValue
  | undefined;

// Marcadores especiais — preservados em output, nunca apagados por prune.
export const NA_MARKER = "DNA";
export const UNKNOWN_MARKER = "UNKNOWN";

// -- Condicionais -----------------------------------------------------------

export type ShowWhen =
  | { field: string; equals: string; section?: string }
  | { field: string; in: string[]; section?: string }
  | { field: string; notIn: string[]; section?: string };

// -- Options de select/radio ------------------------------------------------

export type FieldOption = { value: string; label: string; group?: string };
export type OptionsRef =
  | "countries"
  | "usStates"
  | "relationships"
  | "usContactRelationships"
  | "relativeTypes"
  | "usStatus"
  | "occupations";

// -- Campos atômicos --------------------------------------------------------

type CommonField = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  allowNA?: boolean;
  allowUnknown?: boolean;
  showWhen?: ShowWhen;
  hideWhenAllUnknown?: string[];
  inline?: boolean;
  flexBasis?: string;
  fullWidth?: boolean;
  spaceBefore?: number;
  groupLabel?: string;
  default?: string;
  // Para Actors (ignorado pelo engine):
  ds160?: string;
  ds160List?: string;
};

export type TextField = CommonField & {
  type: "text";
  maxLen?: number;
  noSpecial?: boolean;
};
export type NumberField = CommonField & {
  type: "number";
  maxLen?: number;
};
export type EmailField = CommonField & { type: "email"; maxLen?: number };
export type TextareaField = CommonField & {
  type: "textarea";
  maxLen?: number;
};
export type SelectField = CommonField & {
  type: "select";
  options?: FieldOption[];
  optionsRef?: OptionsRef;
  optionHints?: Record<string, string>;
  filteredBy?: { field: string };
  excludeField?: string;
};
export type RadioField = CommonField & {
  type: "radio";
  options?: FieldOption[];
};
export type DateField = CommonField & {
  type: "date";
  notFuture?: boolean;
  notPast?: boolean;
};
export type DateRangeField = CommonField & {
  type: "daterange";
  notPast?: boolean;
};
export type PhoneField = CommonField & {
  type: "phone";
  phoneCountry?: string;
  phoneLocked?: boolean;
};
export type SsnField = CommonField & { type: "ssn" };
export type FileField = CommonField & {
  type: "file";
  accept?: string;
  maxSizeMb?: number;
};
export type HeadingField = Omit<CommonField, "required"> & {
  type: "heading";
};
export type OrientationField = Omit<CommonField, "required" | "label"> & {
  type: "orientation";
  label?: string;
  text: string;
};
export type AlertField = Omit<CommonField, "required" | "label"> & {
  type: "alert";
  label?: string;
  text: string;
  alertStyle?: "info" | "warning" | "danger";
};

// -- Arrays -----------------------------------------------------------------

export type ArrayField = CommonField & {
  type: "array";
  fields: AtomicField[];
  maxItems?: number;
  minEntries?: number;
  noneOnlyFirstEntry?: boolean;
  noneValue?: string;
  noneField?: string;
};

export type AtomicField =
  | TextField
  | NumberField
  | EmailField
  | TextareaField
  | SelectField
  | RadioField
  | DateField
  | DateRangeField
  | PhoneField
  | SsnField
  | FileField
  | HeadingField
  | OrientationField
  | AlertField;

export type FormField = AtomicField | ArrayField;

// -- Seção ------------------------------------------------------------------

export type FormSection = {
  id: string;
  label: string;
  /** Se presente, a seção inteira só aparece se showWhen for satisfeito. */
  showWhen?: ShowWhen;
  /** Se presente, oculta permanentemente a seção (ex: <14 anos). */
  hideWhenMinor?: boolean;
  fields: FormField[];
};

// -- Schema completo --------------------------------------------------------

export type FormSchema = {
  version: string;
  sections: FormSection[];
};

// Type guards úteis pro renderer
export function isArrayField(f: FormField): f is ArrayField {
  return f.type === "array";
}
export function isDisplayOnly(
  f: FormField,
): f is HeadingField | OrientationField | AlertField {
  return f.type === "heading" || f.type === "orientation" || f.type === "alert";
}
