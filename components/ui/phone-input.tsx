"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Country = {
  code: string;
  name: string;
  dial: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { code: "BR", name: "Brasil", dial: "55", flag: "🇧🇷" },
  { code: "US", name: "Estados Unidos", dial: "1", flag: "🇺🇸" },
  { code: "PT", name: "Portugal", dial: "351", flag: "🇵🇹" },
  { code: "AR", name: "Argentina", dial: "54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dial: "56", flag: "🇨🇱" },
  { code: "CO", name: "Colômbia", dial: "57", flag: "🇨🇴" },
  { code: "MX", name: "México", dial: "52", flag: "🇲🇽" },
  { code: "PE", name: "Peru", dial: "51", flag: "🇵🇪" },
  { code: "UY", name: "Uruguai", dial: "598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguai", dial: "595", flag: "🇵🇾" },
  { code: "EC", name: "Equador", dial: "593", flag: "🇪🇨" },
  { code: "BO", name: "Bolívia", dial: "591", flag: "🇧🇴" },
  { code: "VE", name: "Venezuela", dial: "58", flag: "🇻🇪" },
  { code: "GB", name: "Reino Unido", dial: "44", flag: "🇬🇧" },
  { code: "DE", name: "Alemanha", dial: "49", flag: "🇩🇪" },
  { code: "FR", name: "França", dial: "33", flag: "🇫🇷" },
  { code: "ES", name: "Espanha", dial: "34", flag: "🇪🇸" },
  { code: "IT", name: "Itália", dial: "39", flag: "🇮🇹" },
  { code: "JP", name: "Japão", dial: "81", flag: "🇯🇵" },
  { code: "CN", name: "China", dial: "86", flag: "🇨🇳" },
  { code: "IN", name: "Índia", dial: "91", flag: "🇮🇳" },
  { code: "AU", name: "Austrália", dial: "61", flag: "🇦🇺" },
  { code: "CA", name: "Canadá", dial: "1", flag: "🇨🇦" },
  { code: "IL", name: "Israel", dial: "972", flag: "🇮🇱" },
  { code: "AE", name: "Emirados Árabes", dial: "971", flag: "🇦🇪" },
];

function findCountryByDial(fullNumber: string): { country: Country; local: string } {
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (fullNumber.startsWith(c.dial)) {
      return { country: c, local: fullNumber.slice(c.dial.length) };
    }
  }
  return { country: COUNTRIES[0], local: fullNumber };
}

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
  placeholder = "11988945503",
  required,
  id,
  className,
}: PhoneInputProps) {
  const parsed = findCountryByDial(value);
  const [selected, setSelected] = useState<Country>(parsed.country);
  const [local, setLocal] = useState(parsed.local);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const p = findCountryByDial(value);
      setSelected(p.country);
      setLocal(p.local);
    }
  }, [value]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleLocalChange(newLocal: string) {
    const digits = newLocal.replace(/\D/g, "");
    setLocal(digits);
    onChange(selected.dial + digits);
  }

  function handleCountrySelect(country: Country) {
    setSelected(country);
    setOpen(false);
    setSearch("");
    onChange(country.dial + local);
  }

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
      )
    : COUNTRIES;

  return (
    <div className={cn("flex items-stretch", className)}>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 items-center gap-1 rounded-l-md border border-r-0 border-input bg-muted/50 px-2 text-sm transition-colors hover:bg-muted"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-muted-foreground">+{selected.dial}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border border-border bg-popover p-1 shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-2 pb-2 pt-1">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    selected.code === c.code && "bg-accent",
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-muted-foreground">+{c.dial}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  Nenhum país encontrado.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        id={id}
        type="tel"
        value={local}
        onChange={(e) => handleLocalChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-r-md border bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-3"
      />
    </div>
  );
}
