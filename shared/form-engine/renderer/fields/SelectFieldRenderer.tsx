"use client";

import { useAtomValue } from "jotai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SelectField } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { resolveOptions } from "../../options";
import { NAToggle } from "./NAToggle";

type Props = {
  field: SelectField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

export function SelectFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const state = useAtomValue(atoms.stateAtom);
  const b = useFieldBinding<string>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value = typeof b.value === "string" ? b.value : "";
  let options =
    field.options ?? (field.optionsRef ? resolveOptions(field.optionsRef) : []);

  // filteredBy: só mostra opções com group == valor do campo referenciado
  if (field.filteredBy) {
    const refKey = `${sectionId}.${field.filteredBy.field}`;
    const refVal = state.data[refKey];
    if (typeof refVal === "string" && refVal) {
      options = options.filter((o) => o.group === refVal);
    }
  }

  // excludeField: remove a opção correspondente ao valor de outro campo
  if (field.excludeField) {
    const refKey = arrayScope
      ? `${sectionId}.${field.excludeField}`
      : `${sectionId}.${field.excludeField}`;
    const excluded = state.data[refKey];
    if (typeof excluded === "string" && excluded) {
      options = options.filter((o) => o.value !== excluded);
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={b.key}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Select
        value={disabled ? "" : value}
        onValueChange={(v) => b.setValue(v ?? "")}
        disabled={disabled}
      >
        <SelectTrigger id={b.key} className="h-9 w-full">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field.hint && (
        <p className="text-sm text-muted-foreground">{field.hint}</p>
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
