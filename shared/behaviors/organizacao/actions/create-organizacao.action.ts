"use server";

import { z } from "zod";
import { auth, getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { addAssessor } from "@/shared/models/assessor";
import { createOrganizacao } from "@/shared/models/organizacao";

const assessorSchema = z.object({
  nome: z.string().trim().min(1),
  email: z.string().email(),
  senha: z.string().min(8),
  role: z.enum(["owner", "member"]),
});

const schema = z.object({
  nome: z.string().trim().min(1).max(200),
  shortId: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Short ID deve conter só minúsculas, números e hífen"),
  whatsapp: z.string().trim().regex(/^\d+$/, "WhatsApp deve conter só dígitos"),
  plano: z.enum(["free", "premium"]).default("free"),
  assessores: z.array(assessorSchema).min(1, "Adicione ao menos um assessor"),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; organizacaoUid?: string };

export async function createOrganizacaoAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const { user } = await getUser();
  if (!user || !isMaster(user.role)) {
    return { error: "Apenas Master pode criar organizações" };
  }

  // Garantir pelo menos um owner
  if (!data.assessores.some((a) => a.role === "owner")) {
    return { error: "Pelo menos um assessor deve ser Dono" };
  }

  const org = await createOrganizacao({
    nome: data.nome,
    shortId: data.shortId,
    whatsapp: data.whatsapp,
    plano: data.plano,
  });

  for (const a of data.assessores) {
    const result = await auth.api
      .signUpEmail({
        body: { email: a.email, password: a.senha, name: a.nome },
      })
      .catch((err: unknown) => ({ error: err instanceof Error ? err.message : "signup failed" }));
    if ("error" in result) {
      return { error: `Falha ao criar ${a.email}: ${result.error}` };
    }
    if (!result.user) return { error: `Falha ao criar ${a.email}` };

    await addAssessor({
      userId: result.user.id,
      organizacaoUid: org.uid,
      role: a.role,
    });
  }

  return { error: null, organizacaoUid: org.uid };
}
