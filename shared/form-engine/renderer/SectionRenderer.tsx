"use client";

import { useAtomValue } from "jotai";
import { useEffect } from "react";
import type { FormSection } from "../schema/primitives";
import type { EngineAtoms } from "../state";
import { useEngine } from "../state";
import { isFieldVisible, isSectionVisible } from "../runtime/conditional";
import { FieldDispatch } from "./FieldDispatch";

type Props = {
  section: FormSection;
  atoms: EngineAtoms;
  /** Se true, marca como visitada ao montar (comportamento de modo pages). */
  autoVisit?: boolean;
  uploadContext?: { solicitanteUid: string; token?: string };
};

export function SectionRenderer({
  section,
  atoms,
  autoVisit = true,
  uploadContext,
}: Props) {
  const state = useAtomValue(atoms.stateAtom);
  const { markVisited } = useEngine(atoms);

  useEffect(() => {
    if (autoVisit && !state.isHydrating) {
      markVisited(section.id);
    }
  }, [autoVisit, state.isHydrating, markVisited, section.id]);

  if (!isSectionVisible(section, state)) return null;

  return (
    <section className="flex flex-col gap-4">
      {section.fields.map((field) => {
        if (!isFieldVisible(field, state, section.id)) return null;
        return (
          <FieldDispatch
            key={field.id}
            field={field}
            sectionId={section.id}
            atoms={atoms}
            uploadContext={uploadContext}
          />
        );
      })}
    </section>
  );
}
