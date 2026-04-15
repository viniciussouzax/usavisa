"use client";

import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import type { EngineAtoms } from "../state";
import { useEngine } from "../state";

type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};

async function fetchCep(cep: string): Promise<CepResponse | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    if (!res.ok) return null;
    return (await res.json()) as CepResponse;
  } catch {
    return null;
  }
}

function endsWithPostalCode(key: string): boolean {
  return /PostalCode$/.test(key);
}

function derivePrefix(fieldId: string): string | null {
  const m = fieldId.match(/^(.+)PostalCode$/);
  return m ? m[1] : null;
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Auto-preenche endereço via BrasilAPI quando o usuário digita um CEP de 8
 * dígitos num bloco cujo país selecionado é BRZL. Efeito reativo:
 * observa mudanças em state.data e dispara fetch único por CEP (cache).
 */
export function useCepAutofill(atoms: EngineAtoms) {
  const state = useAtomValue(atoms.stateAtom);
  const engine = useEngine(atoms);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (state.isHydrating) return;

    for (const [key, raw] of Object.entries(state.data)) {
      if (!endsWithPostalCode(key)) continue;
      if (typeof raw !== "string") continue;
      const cep = onlyDigits(raw);
      if (cep.length !== 8) continue;
      if (seenRef.current.has(key + ":" + cep)) continue;

      // Deriva prefixo + seção (key é "section.prefixPostalCode")
      const [sectionId, fieldId] = key.split(".");
      if (!sectionId || !fieldId) continue;
      const prefix = derivePrefix(fieldId);
      if (!prefix) continue;

      const countryKey = `${sectionId}.${prefix}Country`;
      const country = state.data[countryKey];
      if (country !== "BRZL") continue;

      seenRef.current.add(key + ":" + cep);

      void fetchCep(cep).then((resp) => {
        if (!resp) return;
        const street = `${resp.street ?? ""}${resp.neighborhood ? " - " + resp.neighborhood : ""}`.trim();
        if (street) engine.setValue(`${sectionId}.${prefix}Street1`, street.toUpperCase());
        if (resp.city) engine.setValue(`${sectionId}.${prefix}City`, resp.city.toUpperCase());
        if (resp.state) engine.setValue(`${sectionId}.${prefix}State`, resp.state.toUpperCase());
      });
    }
  }, [state.isHydrating, state.data, engine]);
}
