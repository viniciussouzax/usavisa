"use client";

import { useAtomValue } from "jotai";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FormSchema } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { isSectionVisible } from "../../runtime/conditional";
import {
  computeOverallProgress,
  computeSectionStatus,
} from "../../runtime/progress";
import { validateAll } from "../../runtime/validation";
import { finalizeFormAction } from "@/shared/behaviors/form-engine/actions/finalize-form.action";
import { SectionRenderer } from "../SectionRenderer";

type Props = {
  schema: FormSchema;
  atoms: EngineAtoms;
  uploadContext?: { solicitanteUid: string; token?: string };
};

/**
 * Modo pages — usado pelo solicitante. Uma seção visível por vez.
 * goNext() bloqueia se a seção atual tem erros de validação.
 */
export function PagesMode({ schema, atoms, uploadContext }: Props) {
  const state = useAtomValue(atoms.stateAtom);
  const visibleSections = useMemo(
    () => schema.sections.filter((s) => isSectionVisible(s, state)),
    [schema, state],
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [attemptedAdvance, setAttemptedAdvance] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const currentSection =
    visibleSections[currentIdx] ?? visibleSections[0] ?? null;

  const progress = computeOverallProgress(schema.sections, state);
  const currentStatus = currentSection
    ? computeSectionStatus(currentSection, state)
    : null;

  function goNext() {
    if (!currentSection) return;
    const status = computeSectionStatus(currentSection, state);
    if (status.errors.length > 0) {
      setAttemptedAdvance(true);
      return;
    }
    setAttemptedAdvance(false);
    setCurrentIdx((i) => Math.min(i + 1, visibleSections.length - 1));
  }

  function goPrev() {
    setAttemptedAdvance(false);
    setCurrentIdx((i) => Math.max(i - 1, 0));
  }

  async function handleFinalize() {
    if (!uploadContext) return;
    const allErrors = validateAll(schema.sections, state);
    const sectionsWithErrors = Array.from(allErrors.entries()).filter(
      ([, e]) => e.length > 0,
    );
    if (sectionsWithErrors.length > 0) {
      const first = sectionsWithErrors[0][0];
      const idx = visibleSections.findIndex((s) => s.id === first);
      if (idx >= 0) setCurrentIdx(idx);
      setAttemptedAdvance(true);
      toast.error(
        `Corrija erros em ${sectionsWithErrors.length} ${sectionsWithErrors.length === 1 ? "seção" : "seções"} antes de finalizar.`,
      );
      return;
    }
    setFinalizing(true);
    const res = await finalizeFormAction({
      solicitanteUid: uploadContext.solicitanteUid,
      token: uploadContext.token,
      snapshot: {
        data: state.data,
        arrayData: state.arrayData,
        visitedSections: Array.from(state.visitedSections),
        naFields: Array.from(state.naFields),
        unknownFields: Array.from(state.unknownFields),
      },
    });
    setFinalizing(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setFinalized(true);
    toast.success("Formulário finalizado.");
  }

  if (!currentSection) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Nenhuma seção disponível.
      </div>
    );
  }

  const isLast = currentIdx === visibleSections.length - 1;
  const isFirst = currentIdx === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Seção {currentIdx + 1} de {visibleSections.length}
          </span>
          <span>
            {progress.completed} de {progress.total} completas ({progress.percent}%)
          </span>
        </div>
        <Progress value={progress.percent} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{currentSection.label}</h2>
        <SectionRenderer
          section={currentSection}
          atoms={atoms}
          uploadContext={uploadContext}
        />
      </div>

      {attemptedAdvance && currentStatus && currentStatus.errors.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Corrija {currentStatus.errors.length}{" "}
          {currentStatus.errors.length === 1 ? "erro" : "erros"} antes de
          continuar.
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        {!isLast ? (
          <Button type="button" onClick={goNext}>
            Próximo
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinalize}
            disabled={finalizing || finalized}
          >
            {finalizing ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Finalizando...
              </>
            ) : finalized ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Finalizado
              </>
            ) : (
              "Finalizar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
