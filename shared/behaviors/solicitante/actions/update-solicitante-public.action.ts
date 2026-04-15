"use server";

import { z } from "zod";
import { resolveShareToken } from "@/shared/models/share-link";
import { resolveSolicitanteShareToken } from "@/shared/models/solicitante-share-link";
import {
  listSolicitantesBySolicitacao,
  updateSolicitanteDadosExtras,
} from "@/shared/models/solicitante";

const schema = z.object({
  token: z.string().min(1),
  solicitanteUid: z.string().min(1),
  dados: z.record(z.string(), z.string()),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

/**
 * Ação pública: solicitante preenche seu formulário. O token pode ser de
 * dois tipos:
 *   - case token: permite atualizar qualquer solicitante da solicitação;
 *   - applicant token: permite atualizar APENAS o solicitante dono do token.
 */
export async function updateSolicitantePublicAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const asCase = await resolveShareToken(parsed.data.token);
  if (asCase) {
    const solicitantes = await listSolicitantesBySolicitacao(
      asCase.solicitacao.uid,
    );
    const target = solicitantes.find(
      (s) => s.id === parsed.data.solicitanteUid,
    );
    if (!target) {
      return { error: "Solicitante não pertence a esta solicitação" };
    }
    await updateSolicitanteDadosExtras(
      parsed.data.solicitanteUid,
      parsed.data.dados,
    );
    return { error: null };
  }

  const asApplicant = await resolveSolicitanteShareToken(parsed.data.token);
  if (asApplicant) {
    if (asApplicant.solicitante.id !== parsed.data.solicitanteUid) {
      return { error: "Token não corresponde a este solicitante" };
    }
    await updateSolicitanteDadosExtras(
      parsed.data.solicitanteUid,
      parsed.data.dados,
    );
    return { error: null };
  }

  return { error: "Link inválido ou expirado" };
}
