"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOOGLE_FONTS, loadGoogleFonts } from "@/lib/google-fonts";

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
};

/**
 * Select de fontes do Google Fonts com preview ao vivo. Componente
 * controlado — o parent detém o valor via `value`/`onChange`.
 */
export function FontPicker({ id, label, value, onChange }: Props) {
  useEffect(() => {
    loadGoogleFonts([...GOOGLE_FONTS]);
  }, []);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger id={id} style={{ fontFamily: value }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GOOGLE_FONTS.map((font) => (
            <SelectItem
              key={font}
              value={font}
              style={{ fontFamily: font }}
            >
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
