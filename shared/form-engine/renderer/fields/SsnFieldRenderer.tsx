"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SsnField, SsnValue } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { NAToggle } from "./NAToggle";

type Props = {
  field: SsnField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

function isValidSsnValue(v: unknown): v is SsnValue {
  return (
    typeof v === "object" &&
    v !== null &&
    "p1" in v &&
    "p2" in v &&
    "p3" in v
  );
}

export function SsnFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const b = useFieldBinding<SsnValue>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value: SsnValue = isValidSsnValue(b.value)
    ? b.value
    : { p1: "", p2: "", p3: "" };

  function update(part: keyof SsnValue, v: string) {
    const digits = v.replace(/\D/g, "");
    const limits: Record<keyof SsnValue, number> = { p1: 3, p2: 2, p3: 4 };
    b.setValue({ ...value, [part]: digits.slice(0, limits[part]) });
  }

  return (
    <div className="grid gap-2">
      <Label>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          aria-label="SSN primeira parte"
          value={disabled ? "" : value.p1}
          disabled={disabled}
          placeholder="000"
          inputMode="numeric"
          maxLength={3}
          className="h-9 w-[80px] text-center"
          onChange={(e) => update("p1", e.currentTarget.value)}
        />
        <span className="text-muted-foreground">—</span>
        <Input
          aria-label="SSN segunda parte"
          value={disabled ? "" : value.p2}
          disabled={disabled}
          placeholder="00"
          inputMode="numeric"
          maxLength={2}
          className="h-9 w-[64px] text-center"
          onChange={(e) => update("p2", e.currentTarget.value)}
        />
        <span className="text-muted-foreground">—</span>
        <Input
          aria-label="SSN terceira parte"
          value={disabled ? "" : value.p3}
          disabled={disabled}
          placeholder="0000"
          inputMode="numeric"
          maxLength={4}
          className="h-9 w-[88px] text-center"
          onChange={(e) => update("p3", e.currentTarget.value)}
        />
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
