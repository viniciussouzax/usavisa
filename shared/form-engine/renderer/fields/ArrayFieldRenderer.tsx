"use client";

import { useAtomValue } from "jotai";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ArrayField, AtomicField } from "../../schema/primitives";
import { isDisplayOnly } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useEngine } from "../../state";
import { isFieldVisible } from "../../runtime/conditional";
import { FieldDispatch } from "../FieldDispatch";

type Props = {
  field: ArrayField;
  sectionId: string;
  atoms: EngineAtoms;
  uploadContext?: { solicitanteUid: string; token?: string };
};

const DEFAULT_MAX = 5;

/**
 * Renderiza uma lista repetível. Cada entrada é um Record<subId, unknown>
 * armazenado em arrayData[sectionId.arrayId]. Sub-campos são despachados
 * via FieldDispatch com arrayScope, permitindo reuso dos renderers atômicos.
 */
export function ArrayFieldRenderer({ field, sectionId, atoms, uploadContext }: Props) {
  const state = useAtomValue(atoms.stateAtom);
  const { setArray } = useEngine(atoms);
  const arrayKey = `${sectionId}.${field.id}`;
  const rows =
    (state.arrayData[arrayKey] as Record<string, unknown>[] | undefined) ?? [];
  const maxItems = field.maxItems ?? DEFAULT_MAX;

  // Bloqueia "Adicionar" se noneOnlyFirstEntry e primeira entrada marcou NONE.
  const firstIsNone =
    field.noneOnlyFirstEntry &&
    field.noneField &&
    field.noneValue &&
    rows[0]?.[field.noneField] === field.noneValue;

  function addRow() {
    const next = rows.slice();
    next.push({});
    setArray(arrayKey, next);
  }

  function removeRow(index: number) {
    const next = rows.slice();
    next.splice(index, 1);
    setArray(arrayKey, next);
  }

  // Verifica se a última entrada tem todos os campos obrigatórios preenchidos.
  // Usado pra bloquear adicionar novas entradas sem terminar a atual.
  function lastRowComplete(): boolean {
    if (rows.length === 0) return true;
    const last = rows[rows.length - 1];
    const requiredFields = field.fields.filter((f) => "required" in f && f.required);
    return requiredFields.every((f) => {
      const v = last?.[f.id];
      return typeof v === "string" ? v.trim() !== "" : Boolean(v);
    });
  }

  const canAdd =
    rows.length < maxItems && !firstIsNone && lastRowComplete();

  return (
    <div className="grid gap-3">
      <Label>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.hint && (
        <p className="text-sm text-muted-foreground">{field.hint}</p>
      )}

      {rows.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Nenhuma entrada ainda. Clique em &ldquo;Adicionar&rdquo; para incluir.
        </div>
      )}

      {rows.map((_, idx) => (
        <div
          key={idx}
          className="rounded-md border border-border bg-background p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Entrada {idx + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRow(idx)}
              aria-label={`Remover entrada ${idx + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3">
            {field.fields.map((sub) => {
              if (
                !isDisplayOnly(sub) &&
                !isFieldVisible(sub, state, sectionId, { arrayKey, index: idx })
              ) {
                return null;
              }
              return (
                <FieldDispatch
                  key={sub.id}
                  field={sub as AtomicField}
                  sectionId={sectionId}
                  atoms={atoms}
                  arrayScope={{ arrayKey, index: idx }}
                  uploadContext={uploadContext}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={!canAdd}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
