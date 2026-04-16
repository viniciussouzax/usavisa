"use client";

import PhoneInputLib from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import type { E164Number } from "libphonenumber-js/core";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
};

export function PhoneInput({
  value,
  onChange,
  placeholder = "11 98894-5503",
  required,
  id,
  className,
}: PhoneInputProps) {
  const e164 = value ? (`+${value}` as E164Number) : undefined;

  function handleChange(newValue?: E164Number) {
    const digits = newValue ? newValue.replace(/\D/g, "") : "";
    onChange(digits);
  }

  return (
    <PhoneInputLib
      id={id}
      international
      defaultCountry="BR"
      value={e164}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={cn(
        "phone-input-wrapper",
        "[&_.PhoneInputInput]:dark:bg-input/30 [&_.PhoneInputInput]:border-input [&_.PhoneInputInput]:focus-visible:border-ring [&_.PhoneInputInput]:focus-visible:ring-ring/50 [&_.PhoneInputInput]:h-9 [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:rounded-r-md [&_.PhoneInputInput]:border [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:px-2.5 [&_.PhoneInputInput]:py-1 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:shadow-xs [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:transition-[color,box-shadow] [&_.PhoneInputInput]:placeholder:text-muted-foreground [&_.PhoneInputInput]:focus-visible:ring-3",
        "[&_.PhoneInputCountry]:h-9 [&_.PhoneInputCountry]:rounded-l-md [&_.PhoneInputCountry]:border [&_.PhoneInputCountry]:border-r-0 [&_.PhoneInputCountry]:border-input [&_.PhoneInputCountry]:bg-muted/50 [&_.PhoneInputCountry]:px-2.5",
        "[&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountryIcon]:w-6",
        className,
      )}
    />
  );
}
