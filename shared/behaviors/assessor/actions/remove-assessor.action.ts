"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import {
  getAssessorById,
  getAssessorByUserAndOrg,
  removeAssessor,
} from "@/shared/models/assessor";

const schema = z.object({ id: z.string().min(1) });
type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function removeAssessorAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "ID inválido" };

  const target = await getAssessorById(parsed.data.id);
  if (!target) return { error: "Assessor não encontrado" };

  const { user: authed } = await getUser();
  if (!authed) return { error: "Não autenticado" };
  if (!isMaster(authed.role)) {
    const m = await getAssessorByUserAndOrg(authed.id, target.organizacaoUid);
    if (!m?.ativo || (m.role !== "owner" && m.role !== "admin")) {
      return { error: "Apenas owners/admins podem remover assessores" };
    }
    // Não permite se auto-remover — evita lock-out acidental.
    if (m.id === target.id) {
      return { error: "Você não pode remover a si mesmo" };
    }
  }

  await removeAssessor(parsed.data.id);
  return { error: null };
}
