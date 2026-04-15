"use client";

import { Label } from "@/components/ui/label";
import type { RadioField } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { NAToggle } from "./NAToggle";

type Props = {
  field: RadioField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

const DEFAULT_OPTIONS = [
  { value: "Y", label: "Sim" },
  { value: "N", label: "Não" },
];

export function RadioFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const b = useFieldBinding<string>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value = typeof b.value === "string" ? b.value : "";
  const options = field.options ?? DEFAULT_OPTIONS;

  return (
    <div className="grid gap-2">
      <Label>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div
        role="radiogroup"
        aria-label={field.label}
        className="flex flex-wrap gap-2"
      >
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => b.setValue(o.value)}
              className={`inline-flex h-9 items-center rounded-md border px-3 text-sm transition-colors disabled:opacity-50 ${
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
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
