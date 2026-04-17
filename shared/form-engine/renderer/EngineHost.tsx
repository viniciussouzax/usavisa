"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { FormDataSnapshot } from "@/shared/models/form-data";
import { DS160_SCHEMA } from "../schema";
import {
  createEngineAtoms,
  useAutoSave,
  useHydrateEngine,
} from "../state";
import { usePruneOnHide } from "../runtime/prune";
import { useCepAutofill } from "../runtime/brasilapi";
import { AccordionMode } from "./modes/AccordionMode";
import { PagesMode } from "./modes/PagesMode";

export type EngineHostProps = {
  solicitanteUid: string;
  /** Token público (case ou applicant). Ausente no modo assessor. */
  token?: string;
  initialSnapshot: FormDataSnapshot;
  /** accordion = todas as seções; pages = uma por vez. */
  mode?: "accordion" | "pages";
};

export function EngineHost({
  solicitanteUid,
  token,
  initialSnapshot,
  mode = "accordion",
}: EngineHostProps) {
  const atoms = useMemo(() => createEngineAtoms(), []);
  useHydrateEngine(atoms, initialSnapshot);
  usePruneOnHide(atoms, DS160_SCHEMA);
  useCepAutofill(atoms);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useAutoSave(atoms, {
    solicitanteUid,
    token,
    onSaveStart: () => setSaveState("saving"),
    onSaveEnd: (err) => {
      if (err) {
        setSaveState("error");
        setSaveError(err);
      } else {
        setSaveState("saved");
        setSaveError(null);
        setTimeout(() => setSaveState("idle"), 1500);
      }
    },
  });

  const uploadContext = { solicitanteUid, token };

  return (
    <div className="flex flex-col gap-4">
      <SaveIndicator state={saveState} error={saveError} />
      {mode === "pages" ? (
        <PagesMode
          schema={DS160_SCHEMA}
          atoms={atoms}
          uploadContext={uploadContext}
        />
      ) : (
        <AccordionMode
          schema={DS160_SCHEMA}
          atoms={atoms}
          uploadContext={uploadContext}
        />
      )}
    </div>
  );
}

function SaveIndicator({
  state,
  error,
}: {
  state: "idle" | "saving" | "saved" | "error";
  error: string | null;
}) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Salvando...
      </div>
    );
  }
  if (state === "saved") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        Salvo
      </div>
    );
  }
  return (
    <div className="text-sm text-destructive">
      Falha ao salvar: {error ?? "erro desconhecido"}
    </div>
  );
}
