import type { FormSection } from "../schema/primitives";
import { validateSection, type FieldError } from "./validation";

type Ctx = {
  data: Record<string, unknown>;
  arrayData: Record<string, unknown[]>;
  naFields: Set<string>;
  unknownFields: Set<string>;
  visitedSections: Set<string>;
};

export type SectionStatus = {
  id: string;
  label: string;
  visited: boolean;
  errors: FieldError[];
  complete: boolean;
};

/**
 * Calcula status de uma seção. Uma seção é "completa" apenas se:
 *   1. Foi visitada
 *   2. Não tem erros de validação
 *   3. Tem ao menos 1 campo required preenchido (evita "tudo vazio = ok")
 */
export function computeSectionStatus(
  section: FormSection,
  ctx: Ctx,
): SectionStatus {
  const errors = validateSection(section, ctx);
  const visited = ctx.visitedSections.has(section.id);
  const hasRequiredData =
    Object.keys(ctx.data).some((k) => k.startsWith(`${section.id}.`)) ||
    Object.keys(ctx.arrayData).some((k) => k.startsWith(`${section.id}.`)) ||
    Array.from(ctx.naFields).some((k) => k.startsWith(`${section.id}.`));
  const complete = visited && errors.length === 0 && hasRequiredData;
  return { id: section.id, label: section.label, visited, errors, complete };
}

export function computeOverallProgress(
  sections: FormSection[],
  ctx: Ctx,
): { completed: number; total: number; percent: number } {
  let completed = 0;
  for (const s of sections) {
    if (computeSectionStatus(s, ctx).complete) completed++;
  }
  const total = sections.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
