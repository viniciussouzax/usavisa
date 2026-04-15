"use client";

import { atom, useAtom, useAtomValue } from "jotai";

/**
 * Estratégia "reward early, punish late" (engine.md §10a):
 *   - Campo novo (nunca invalidado): não mostra erro até primeira validação que falhar.
 *   - Campo já invalidado uma vez: mostra erro em cada input até ficar correto.
 *   - Campo concluído que voltou a ser editado: só valida no blur.
 *
 * Gerenciamos por chave canônica (`secId.fieldId` ou `arrayKey[idx].subId`).
 * `visited` = recebeu blur pelo menos uma vez. `invalidated` = flag permanente
 * após primeiro erro. O renderer decide o que mostrar com base nesses flags.
 */

type BlurState = {
  visited: Set<string>;
  invalidated: Set<string>;
};

const blurAtom = atom<BlurState>({
  visited: new Set<string>(),
  invalidated: new Set<string>(),
});

export function useBlurState() {
  return useAtomValue(blurAtom);
}

export function useBlurActions() {
  const [, set] = useAtom(blurAtom);
  return {
    markVisited: (key: string) => {
      set((s) => {
        if (s.visited.has(key)) return s;
        const next = new Set(s.visited);
        next.add(key);
        return { ...s, visited: next };
      });
    },
    markInvalidated: (key: string) => {
      set((s) => {
        if (s.invalidated.has(key)) return s;
        const next = new Set(s.invalidated);
        next.add(key);
        return { ...s, invalidated: next };
      });
    },
    clearInvalidated: (key: string) => {
      set((s) => {
        if (!s.invalidated.has(key)) return s;
        const next = new Set(s.invalidated);
        next.delete(key);
        return { ...s, invalidated: next };
      });
    },
  };
}

/**
 * Decide se um erro deve ser exibido agora dado o histórico do campo.
 * - Se está invalidado: mostra sempre (punish late).
 * - Se ainda não foi visitado: não mostra (reward early).
 * - Se foi visitado mas nunca invalidou: mostra só se houver erro real.
 */
export function shouldShowError(
  key: string,
  hasError: boolean,
  state: BlurState,
): boolean {
  if (!hasError) return false;
  if (state.invalidated.has(key)) return true;
  return state.visited.has(key);
}
