"use client";

import { useAtomValue } from "jotai";
import { Check, ChevronDown, CircleAlert } from "lucide-react";
import { useState } from "react";
import type { FormSchema } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { isSectionVisible } from "../../runtime/conditional";
import { computeSectionStatus } from "../../runtime/progress";
import { SectionRenderer } from "../SectionRenderer";

type Props = {
  schema: FormSchema;
  atoms: EngineAtoms;
  uploadContext?: { solicitanteUid: string; token?: string };
};

/**
 * Modo accordion — usado pelo assessor. Todas as seções visíveis, uma
 * expandida por vez (re-clicável). Sem bloqueio de validação (assessor
 * navega livre).
 */
export function AccordionMode({ schema, atoms, uploadContext }: Props) {
  const state = useAtomValue(atoms.stateAtom);
  const [openId, setOpenId] = useState<string | null>(
    () => schema.sections[0]?.id ?? null,
  );

  return (
    <div className="flex flex-col gap-2">
      {schema.sections.map((section) => {
        if (!isSectionVisible(section, state)) return null;
        const status = computeSectionStatus(section, state);
        const isOpen = openId === section.id;
        return (
          <div
            key={section.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent/50"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2">
                {status.complete ? (
                  <span
                    aria-label="Seção completa"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  >
                    <Check className="h-3 w-3" />
                  </span>
                ) : status.errors.length > 0 && status.visited ? (
                  <span
                    aria-label="Seção com erros"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                  >
                    <CircleAlert className="h-3 w-3" />
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                  >
                    ·
                  </span>
                )}
                <span className="text-sm font-medium">{section.label}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-border px-4 py-4">
                <SectionRenderer
                  section={section}
                  atoms={atoms}
                  uploadContext={uploadContext}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
