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
import type {
  DateRangeField,
  DateRangeValue,
  DateValue,
} from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import { NAToggle } from "./NAToggle";

type Props = {
  field: DateRangeField;
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

function emptyDate(): DateValue {
  return { day: "", month: "", year: "" };
}
function emptyRange(): DateRangeValue {
  return { from: emptyDate(), to: emptyDate() };
}

function isValidRange(v: unknown): v is DateRangeValue {
  return (
    typeof v === "object" &&
    v !== null &&
    "from" in v &&
    "to" in v &&
    typeof (v as DateRangeValue).from === "object" &&
    typeof (v as DateRangeValue).to === "object"
  );
}

function DatePicker({
  value,
  disabled,
  onChange,
  idBase,
}: {
  value: DateValue;
  disabled: boolean;
  onChange: (v: DateValue) => void;
  idBase: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={disabled ? "" : value.day}
        onValueChange={(v) => onChange({ ...value, day: v ?? "" })}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 w-[80px]" id={`${idBase}-day`}>
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
        onValueChange={(v) => onChange({ ...value, month: v ?? "" })}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 w-[84px]">
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
        className="h-9 w-[80px]"
        onChange={(e) =>
          onChange({ ...value, year: e.currentTarget.value.replace(/\D/g, "") })
        }
      />
    </div>
  );
}

export function DateRangeFieldRenderer({
  field,
  sectionId,
  atoms,
  arrayScope,
}: Props) {
  const b = useFieldBinding<DateRangeValue>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const value: DateRangeValue = isValidRange(b.value) ? b.value : emptyRange();

  return (
    <div className="grid gap-2">
      <Label>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">De</span>
        <DatePicker
          value={value.from}
          disabled={disabled}
          idBase={`${b.key}-from`}
          onChange={(d) => b.setValue({ ...value, from: d })}
        />
        <span className="text-sm text-muted-foreground">até</span>
        <DatePicker
          value={value.to}
          disabled={disabled}
          idBase={`${b.key}-to`}
          onChange={(d) => b.setValue({ ...value, to: d })}
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
