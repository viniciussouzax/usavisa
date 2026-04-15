"use client";

import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import type {
  FormDataSnapshot,
} from "@/shared/models/form-data";
import { saveFormDataAction } from "@/shared/behaviors/form-engine/actions/save-form-data.action";

/**
 * Estado em memória do engine — um conjunto de atoms lidos por todos os
 * componentes de campo e observados pelo auto-save. NÃO importar este
 * módulo em server components: é 100% client.
 */

type EngineState = {
  data: Record<string, unknown>;
  arrayData: Record<string, unknown[]>;
  visitedSections: Set<string>;
  naFields: Set<string>;
  unknownFields: Set<string>;
  /** True enquanto carrega dados do servidor — suprime auto-save. */
  isHydrating: boolean;
  /** Incrementa a cada mudança — dispara auto-save. */
  dirtyTick: number;
};

const EMPTY_STATE: EngineState = {
  data: {},
  arrayData: {},
  visitedSections: new Set(),
  naFields: new Set(),
  unknownFields: new Set(),
  isHydrating: true,
  dirtyTick: 0,
};

/** Cria atoms por instância do engine — permite múltiplos engines coexistirem. */
export function createEngineAtoms() {
  const stateAtom = atom<EngineState>({ ...EMPTY_STATE });
  return { stateAtom };
}

export type EngineAtoms = ReturnType<typeof createEngineAtoms>;

// -- Helpers de acesso ------------------------------------------------------

export function useEngineValue<T = unknown>(
  atoms: EngineAtoms,
  key: string,
): T | undefined {
  const s = useAtomValue(atoms.stateAtom);
  return s.data[key] as T | undefined;
}

export function useEngineArray(
  atoms: EngineAtoms,
  arrayKey: string,
): Record<string, unknown>[] {
  const s = useAtomValue(atoms.stateAtom);
  return (s.arrayData[arrayKey] ?? []) as Record<string, unknown>[];
}

export function useEngine(atoms: EngineAtoms) {
  const [state, setState] = useAtom(atoms.stateAtom);

  const setValue = useCallback(
    (key: string, value: unknown) => {
      setState((prev) => ({
        ...prev,
        data: { ...prev.data, [key]: value },
        dirtyTick: prev.isHydrating ? prev.dirtyTick : prev.dirtyTick + 1,
      }));
    },
    [setState],
  );

  const deleteValue = useCallback(
    (key: string) => {
      setState((prev) => {
        if (!(key in prev.data)) return prev;
        const next = { ...prev.data };
        delete next[key];
        return {
          ...prev,
          data: next,
          dirtyTick: prev.isHydrating ? prev.dirtyTick : prev.dirtyTick + 1,
        };
      });
    },
    [setState],
  );

  const setArray = useCallback(
    (arrayKey: string, rows: Record<string, unknown>[]) => {
      setState((prev) => ({
        ...prev,
        arrayData: { ...prev.arrayData, [arrayKey]: rows },
        dirtyTick: prev.isHydrating ? prev.dirtyTick : prev.dirtyTick + 1,
      }));
    },
    [setState],
  );

  const deleteArray = useCallback(
    (arrayKey: string) => {
      setState((prev) => {
        if (!(arrayKey in prev.arrayData)) return prev;
        const next = { ...prev.arrayData };
        delete next[arrayKey];
        return {
          ...prev,
          arrayData: next,
          dirtyTick: prev.isHydrating ? prev.dirtyTick : prev.dirtyTick + 1,
        };
      });
    },
    [setState],
  );

  const markVisited = useCallback(
    (sectionId: string) => {
      setState((prev) => {
        if (prev.visitedSections.has(sectionId)) return prev;
        const next = new Set(prev.visitedSections);
        next.add(sectionId);
        return { ...prev, visitedSections: next, dirtyTick: prev.dirtyTick + 1 };
      });
    },
    [setState],
  );

  const toggleNA = useCallback(
    (key: string, enabled: boolean) => {
      setState((prev) => {
        const next = new Set(prev.naFields);
        if (enabled) next.add(key);
        else next.delete(key);
        return { ...prev, naFields: next, dirtyTick: prev.dirtyTick + 1 };
      });
    },
    [setState],
  );

  const toggleUnknown = useCallback(
    (key: string, enabled: boolean) => {
      setState((prev) => {
        const next = new Set(prev.unknownFields);
        if (enabled) next.add(key);
        else next.delete(key);
        return { ...prev, unknownFields: next, dirtyTick: prev.dirtyTick + 1 };
      });
    },
    [setState],
  );

  return {
    state,
    setValue,
    deleteValue,
    setArray,
    deleteArray,
    markVisited,
    toggleNA,
    toggleUnknown,
  };
}

// -- Hidratação inicial + auto-save -----------------------------------------

export function useHydrateEngine(
  atoms: EngineAtoms,
  initial: FormDataSnapshot,
) {
  const [, setState] = useAtom(atoms.stateAtom);
  useEffect(() => {
    setState({
      data: initial.data,
      arrayData: initial.arrayData,
      visitedSections: new Set(initial.visitedSections),
      naFields: new Set(initial.naFields),
      unknownFields: new Set(initial.unknownFields),
      isHydrating: false,
      dirtyTick: 0,
    });
  }, [atoms, initial, setState]);
}

type AutoSaveOptions = {
  solicitanteUid: string;
  token?: string;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveEnd?: (err: string | null) => void;
};

/**
 * Auto-save com debounce + flush em visibilitychange/beforeunload.
 *
 * Implementação cuidadosa pra evitar loops:
 *   - state é lido via ref (nunca entra no deps do effect de debounce),
 *     senão cada mudança de estado re-cria o effect e o debounce nunca
 *     acumula o suficiente pra disparar.
 *   - callbacks de save (onSaveStart/onSaveEnd) também ficam em ref, pra
 *     que re-renders do host não invalidem o effect.
 *   - dirtyTick é a única dep reativa — incrementa a cada mutação real.
 */
export function useAutoSave(atoms: EngineAtoms, opts: AutoSaveOptions) {
  const { solicitanteUid, token, debounceMs = 1500 } = opts;
  const state = useAtomValue(atoms.stateAtom);

  // Refs estáveis que sempre refletem o último valor.
  const stateRef = useRef(state);
  const optsRef = useRef(opts);
  stateRef.current = state;
  optsRef.current = opts;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const inFlightRef = useRef(false);

  const flush = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    pendingRef.current = false;
    const s = stateRef.current;
    const snapshot = {
      data: s.data,
      arrayData: s.arrayData,
      visitedSections: Array.from(s.visitedSections),
      naFields: Array.from(s.naFields),
      unknownFields: Array.from(s.unknownFields),
    };
    optsRef.current.onSaveStart?.();
    try {
      const res = await saveFormDataAction({
        solicitanteUid,
        token,
        snapshot,
      });
      optsRef.current.onSaveEnd?.(res.error);
    } finally {
      inFlightRef.current = false;
    }
  }, [solicitanteUid, token]);

  // Debounced save em cada dirtyTick. Dependência MÍNIMA: apenas o tick.
  useEffect(() => {
    if (state.isHydrating || state.dirtyTick === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = true;
    timerRef.current = setTimeout(() => {
      void flush();
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.dirtyTick, state.isHydrating]);

  // Flush imediato em visibilitychange/beforeunload.
  useEffect(() => {
    function onHidden() {
      if (document.visibilityState === "hidden" && pendingRef.current) {
        void flush();
      }
    }
    function onBeforeUnload() {
      if (pendingRef.current) void flush();
    }
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flush]);

  return { flush };
}
