"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DateField, DateValue } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { NAToggle } from "./NAToggle";

type Props = {
  field: DateField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

const MONTHS = [
  { value: "JAN", label: "JAN" },
  { value: "FEB", label: "FEV" },
  { value: "MAR", label: "MAR" },
  { value: "APR", label: "ABR" },
  { value: "MAY", label: "MAI" },
  { value: "JUN", label: "JUN" },
  { value: "JUL", label: "JUL" },
  { value: "AUG", label: "AGO" },
  { value: "SEP", label: "SET" },
  { value: "OCT", label: "OUT" },
  { value: "NOV", label: "NOV" },
  { value: "DEC", label: "DEZ" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

function isValidDateValue(v: unknown): v is DateValue {
  return (
    typeof v === "object" &&
    v !== null &&
    "day" in v &&
    "month" in v &&
    "year" in v
  );
}

export function DateFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const b = useFieldBinding<DateValue>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value: DateValue = isValidDateValue(b.value)
    ? b.value
    : { day: "", month: "", year: "" };

  function update(part: keyof DateValue, v: string | null) {
    b.setValue({ ...value, [part]: v ?? "" });
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${b.key}-day`}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Select
          value={disabled ? "" : value.day}
          onValueChange={(v) => update("day", v)}
          disabled={disabled}
        >
          <SelectTrigger id={`${b.key}-day`} className="h-9 w-[88px]">
            <SelectValue placeholder="Dia" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={disabled ? "" : value.month}
          onValueChange={(v) => update("month", v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-[96px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={disabled ? "" : value.year}
          disabled={disabled}
          placeholder="AAAA"
          maxLength={4}
          inputMode="numeric"
          className="h-9 w-[96px]"
          onChange={(e) => update("year", e.currentTarget.value.replace(/\D/g, ""))}
        />
      </div>
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
