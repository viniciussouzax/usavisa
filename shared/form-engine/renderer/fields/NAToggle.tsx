"use client";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  allowNA?: boolean;
  allowUnknown?: boolean;
  naChecked: boolean;
  unknownChecked: boolean;
  onToggleNA: (v: boolean) => void;
  onToggleUnknown: (v: boolean) => void;
};

/**
 * allowNA e allowUnknown são mutuamente exclusivos — marcar um limpa o outro.
 */
export function NAToggle({
  allowNA,
  allowUnknown,
  naChecked,
  unknownChecked,
  onToggleNA,
  onToggleUnknown,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {allowNA && (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={naChecked}
            onCheckedChange={(checked) => {
              const next = checked === true;
              if (next && unknownChecked) onToggleUnknown(false);
              onToggleNA(next);
            }}
          />
          Não se aplica
        </label>
      )}
      {allowUnknown && (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={unknownChecked}
            onCheckedChange={(checked) => {
              const next = checked === true;
              if (next && naChecked) onToggleNA(false);
              onToggleUnknown(next);
            }}
          />
          Não sei
        </label>
      )}
    </div>
  );
}
