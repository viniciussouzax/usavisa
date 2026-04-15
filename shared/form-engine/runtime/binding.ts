"use client";

import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { EngineAtoms } from "../state";
import { useEngine } from "../state";

export type ArrayScope = {
  arrayKey: string;
  index: number;
};

type Binding<T> = {
  /** Chave canônica pra naFields/unknownFields/showWhen. */
  key: string;
  value: T | undefined;
  setValue: (v: T) => void;
  isNA: boolean;
  isUnknown: boolean;
  toggleNA: (v: boolean) => void;
  toggleUnknown: (v: boolean) => void;
};

/**
 * Resolve leitura/gravação de um campo, automaticamente escolhendo entre
 * `data` (campo comum) e `arrayData[arrayKey][index][fieldId]` (sub-campo
 * de array).
 */
export function useFieldBinding<T = unknown>(
  atoms: EngineAtoms,
  sectionId: string,
  fieldId: string,
  arrayScope?: ArrayScope,
): Binding<T> {
  const state = useAtomValue(atoms.stateAtom);
  const engine = useEngine(atoms);

  // Chave canônica pra marcadores/showWhen (inclui scope pra não colidir).
  const key = arrayScope
    ? `${arrayScope.arrayKey}[${arrayScope.index}].${fieldId}`
    : `${sectionId}.${fieldId}`;

  let value: T | undefined;
  if (arrayScope) {
    const rows =
      (state.arrayData[arrayScope.arrayKey] as Record<string, unknown>[] | undefined) ??
      [];
    const row = rows[arrayScope.index];
    value = row ? (row[fieldId] as T | undefined) : undefined;
  } else {
    value = state.data[key] as T | undefined;
  }

  const setValue = useCallback(
    (v: T) => {
      if (arrayScope) {
        const rows =
          (state.arrayData[arrayScope.arrayKey] as Record<string, unknown>[] | undefined) ??
          [];
        const next = rows.slice();
        const row = { ...(next[arrayScope.index] ?? {}) };
        row[fieldId] = v as unknown;
        next[arrayScope.index] = row;
        engine.setArray(arrayScope.arrayKey, next);
      } else {
        engine.setValue(key, v as unknown);
      }
    },
    [arrayScope, engine, fieldId, key, state.arrayData],
  );

  const isNA = state.naFields.has(key);
  const isUnknown = state.unknownFields.has(key);
  const toggleNA = useCallback((v: boolean) => engine.toggleNA(key, v), [engine, key]);
  const toggleUnknown = useCallback(
    (v: boolean) => engine.toggleUnknown(key, v),
    [engine, key],
  );

  return { key, value, setValue, isNA, isUnknown, toggleNA, toggleUnknown };
}
