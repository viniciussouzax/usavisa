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
import type { PhoneField } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";
import {
  PHONE_COUNTRIES,
  phoneCountryByCode,
} from "../../options/phone-countries";
import { NAToggle } from "./NAToggle";

type Props = {
  field: PhoneField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
};

/**
 * Valor armazenado: string "{DIAL} {NUMBER}" — ex: "+55 11999999999".
 * Split/combine em runtime. Se DIAL trocar, resto preserva.
 */
function parse(raw: string): { dial: string; number: string } {
  if (!raw) return { dial: "+55", number: "" };
  const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) return { dial: "+55", number: raw };
  return { dial: match[1], number: match[2].trim() };
}

function join(dial: string, number: string): string {
  return `${dial} ${number.trim()}`;
}

export function PhoneFieldRenderer({ field, sectionId, atoms, arrayScope }: Props) {
  const b = useFieldBinding<string>(atoms, sectionId, field.id, arrayScope);
  const disabled = b.isNA || b.isUnknown;
  const raw = typeof b.value === "string" ? b.value : "";
  const { dial, number } = parse(raw);
  const countryInitial = phoneCountryByCode(field.phoneCountry).dial;
  const currentDial = dial || countryInitial;

  function updateDial(newDial: string) {
    if (!newDial) return;
    b.setValue(join(newDial, number));
  }
  function updateNumber(n: string) {
    // Digits + (spaces/parens/dashes permitidos pra formatação)
    const cleaned = n.replace(/[^\d()\s-]/g, "");
    b.setValue(join(currentDial, cleaned));
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${b.key}-num`}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        <Select
          value={currentDial}
          onValueChange={(v) => updateDial(v ?? "")}
          disabled={disabled || field.phoneLocked}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="DDI" />
          </SelectTrigger>
          <SelectContent>
            {PHONE_COUNTRIES.map((p) => (
              <SelectItem key={p.code} value={p.dial}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={`${b.key}-num`}
          value={disabled ? "" : number}
          disabled={disabled}
          placeholder="(11) 99999-9999"
          inputMode="tel"
          className="h-9"
          onChange={(e) => updateNumber(e.currentTarget.value)}
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
