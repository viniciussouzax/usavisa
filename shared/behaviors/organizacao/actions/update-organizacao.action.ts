"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { updateOrganizacao } from "@/shared/models/organizacao";

const schema = z.object({
  uid: z.string().min(1),
  shortId: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  nome: z.string().trim().min(1).max(200).optional(),
  whatsapp: z.string().trim().regex(/^\d+$/).optional(),
  logoLight: z.string().url().nullable().optional(),
  logoDark: z.string().url().nullable().optional(),
  iconLight: z.string().url().nullable().optional(),
  iconDark: z.string().url().nullable().optional(),
  color1: z.string().optional(),
  color2: z.string().optional(),
  color3: z.string().optional(),
  fontTitle: z.string().optional(),
  fontBody: z.string().optional(),
  ativa: z.boolean().optional(),
  plano: z.enum(["free", "premium"]).optional(),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function updateOrganizacaoAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { uid, ...rest } = parsed.data;

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(user.id, uid);
    if (!membership?.ativo || membership.role === "member") {
      return { error: "Sem permissão para editar esta organização" };
    }
    // Apenas master pode mudar o plano
    if (rest.plano !== undefined) {
      return { error: "Apenas Master pode alterar o plano" };
    }
  }

  await updateOrganizacao(uid, rest);
  return { error: null };
}
