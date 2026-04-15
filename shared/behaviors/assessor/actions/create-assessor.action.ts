"use server";

import { z } from "zod";
import { auth, getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import {
  addAssessor,
  getAssessorByUserAndOrg,
} from "@/shared/models/assessor";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";

const schema = z.object({
  shortId: z.string().min(1),
  nome: z.string().min(1).max(120),
  email: z.string().email(),
  senha: z.string().min(8),
  role: z.enum(["owner", "admin", "member"] as const),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

/**
 * Cria usuário via Better Auth e adiciona como assessor da org. Se o email
 * já existe no sistema (ex: master ou assessor de outra org), falha com erro
 * claro — re-adicionar usuário existente exige outro fluxo (TODO futuro).
 */
export async function createAssessorAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const org = await getOrganizacaoByShortId(parsed.data.shortId);
  if (!org) return { error: "Organização não encontrada" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };
  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, org.uid);
    if (!m?.ativo || (m.role !== "owner" && m.role !== "admin")) {
      return { error: "Apenas owners/admins podem adicionar assessores" };
    }
  }

  const result = await auth.api
    .signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.senha,
        name: parsed.data.nome,
      },
    })
    .catch((err: unknown) => ({
      error: err instanceof Error ? err.message : "signup failed",
    }));
  if ("error" in result) {
    return { error: `Falha ao criar usuário: ${result.error}` };
  }
  if (!result.user) return { error: "Falha ao criar usuário" };

  await addAssessor({
    userId: result.user.id,
    organizacaoUid: org.uid,
    role: parsed.data.role,
  });
  return { error: null };
}
