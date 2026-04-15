"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  EmailField,
  NumberField,
  TextareaField,
  TextField,
} from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { removeSpecialChars, sanitizeText } from "../../runtime/sanitize";
import { NAToggle } from "./NAToggle";

type Props = {
  field: TextField | NumberField | EmailField | TextareaField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

export function TextFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const b = useFieldBinding<string>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value = typeof b.value === "string" ? b.value : "";

  function handleChange(raw: string) {
    let v = raw;
    if (field.type === "text" || field.type === "textarea") {
      v = sanitizeText(v);
      if (field.type === "text" && "noSpecial" in field && field.noSpecial) {
        v = removeSpecialChars(v);
      }
      if ("maxLen" in field && field.maxLen) v = v.slice(0, field.maxLen);
    } else if (field.type === "number") {
      v = v.replace(/\D/g, "");
      if (field.maxLen) v = v.slice(0, field.maxLen);
    } else if (field.type === "email") {
      if (field.maxLen) v = v.slice(0, field.maxLen);
    }
    b.setValue(v);
  }

  const isTextarea = field.type === "textarea";
  const inputMode =
    field.type === "number" ? "numeric" : field.type === "email" ? "email" : undefined;
  const inputType = field.type === "email" ? "email" : "text";
  const htmlId = b.key;

  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlId}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {isTextarea ? (
        <textarea
          id={htmlId}
          value={disabled ? "" : value}
          disabled={disabled}
          onChange={(e) => handleChange(e.currentTarget.value)}
          rows={3}
          className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        />
      ) : (
        <Input
          id={htmlId}
          value={disabled ? "" : value}
          disabled={disabled}
          type={inputType}
          inputMode={inputMode}
          onChange={(e) => handleChange(e.currentTarget.value)}
        />
      )}
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
      {(field.allowNA || field.allowUnknown) && (
        <NAToggle
          allowNA={field.allowNA}
          allowUnknown={field.allowUnknown}
          naChecked={b.isNA}
          unknownChecked={b.isUnknown}
          onToggleNA={b.toggleNA}
          onToggleUnknown={b.toggleUnknown}
        />
      )}
    </div>
  );
}
