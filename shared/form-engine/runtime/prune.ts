"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import type { FormSchema } from "../schema/primitives";
import {
  isArrayField,
  isDisplayOnly,
} from "../schema/primitives";
import type { EngineAtoms } from "../state";
import { isFieldVisible, isSectionVisible } from "./conditional";

/**
 * Prune-on-hide: a regra mais crítica do engine. Quando um campo ou seção
 * é ocultado por falhar na condição `showWhen`, o valor correspondente é
 * removido de `data` / `arrayData`. Markers (NA/Unknown) são preservados —
 * representam escolha intencional do usuário.
 *
 * Implementação reativa: observa mudanças de estado e purga em batch.
 */
export function usePruneOnHide(atoms: EngineAtoms, schema: FormSchema) {
  const [state, setState] = useAtom(atoms.stateAtom);
  const { isHydrating, data, arrayData } = state;

  useEffect(() => {
    if (isHydrating) return;

    const dataKeysToRemove: string[] = [];
    const arrayKeysToRemove: string[] = [];

    for (const section of schema.sections) {
      const sectionVisible = isSectionVisible(section, state);

      for (const field of section.fields) {
        if (isDisplayOnly(field)) continue;
        const fieldVisible = sectionVisible && isFieldVisible(field, state, section.id);
        if (fieldVisible) continue;

        if (isArrayField(field)) {
          const arrayKey = `${section.id}.${field.id}`;
          if (arrayKey in arrayData) arrayKeysToRemove.push(arrayKey);
          continue;
        }

        const key = `${section.id}.${field.id}`;
        if (key in data) dataKeysToRemove.push(key);
      }
    }

    if (dataKeysToRemove.length === 0 && arrayKeysToRemove.length === 0) return;

    setState((prev) => {
      const nextData = { ...prev.data };
      for (const k of dataKeysToRemove) delete nextData[k];
      const nextArray = { ...prev.arrayData };
      for (const k of arrayKeysToRemove) delete nextArray[k];
      return {
        ...prev,
        data: nextData,
        arrayData: nextArray,
        dirtyTick: prev.dirtyTick + 1,
      };
    });
  }, [isHydrating, data, arrayData, schema, setState, state]);
}
