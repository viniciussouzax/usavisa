"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import {
  getAssessorById,
  getAssessorByUserAndOrg,
  updateAssessor,
} from "@/shared/models/assessor";
import { db } from "@/db";
import { assessor, user } from "@/db/schema";

const schema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1).max(120).optional(),
  role: z.enum(["owner", "admin", "member"] as const).optional(),
  ativo: z.boolean().optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updateAssessorAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const target = await getAssessorById(parsed.data.id);
  if (!target) return { error: "Assessor não encontrado" };

  const { user: authed } = await getUser();
  if (!authed) return { error: "Não autenticado" };
  if (!isMaster(authed.role)) {
    const m = await getAssessorByUserAndOrg(authed.id, target.organizacaoUid);
    if (!m?.ativo || (m.role !== "owner" && m.role !== "admin")) {
      return { error: "Apenas owners/admins podem editar assessores" };
    }
  }

  const patch: { role?: "owner" | "admin" | "member"; ativo?: boolean } = {};
  if (parsed.data.role !== undefined) patch.role = parsed.data.role;
  if (parsed.data.ativo !== undefined) patch.ativo = parsed.data.ativo;
  if (Object.keys(patch).length > 0) {
    await updateAssessor(parsed.data.id, patch);
  }

  // Nome mora no user (Better Auth), não no assessor — precisa descobrir userId.
  if (parsed.data.nome) {
    const [row] = await db
      .select({ userId: assessor.userId })
      .from(assessor)
      .where(eq(assessor.id, parsed.data.id))
      .limit(1);
    if (row) {
      await db
        .update(user)
        .set({ name: parsed.data.nome, updatedAt: new Date() })
        .where(eq(user.id, row.userId));
    }
  }

  return { error: null };
}
