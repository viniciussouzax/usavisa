"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  createSolicitanteShareLink,
  getLatestShareLinkForSolicitante,
} from "@/shared/models/solicitante-share-link";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";

const schema = z.object({
  solicitanteUid: z.string().min(1),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null; token?: string };

/**
 * Retorna o token individual ativo do solicitante. Se não houver (ou o
 * último estiver revogado), cria um novo. Evita que o assessor tenha que
 * chamar "gerar" explicitamente antes de copiar o link.
 */
export async function ensureSolicitanteShareLinkAction(
  input: Input,
): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { user } = await getUser();
  if (!user) return { error: "Não autenticado" };

  const [row] = await db
    .select({ organizacaoUid: solicitacao.organizacaoUid })
    .from(solicitante)
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitante.uid, parsed.data.solicitanteUid))
    .limit(1);
  if (!row) return { error: "Solicitante não encontrado" };

  if (!isMaster(user.role)) {
    const membership = await getAssessorByUserAndOrg(
      user.id,
      row.organizacaoUid,
    );
    if (!membership?.ativo) return { error: "Sem permissão" };
  }

  const latest = await getLatestShareLinkForSolicitante(
    parsed.data.solicitanteUid,
  );
  if (latest && !latest.revoked) {
    return { error: null, token: latest.token };
  }

  const token = await createSolicitanteShareLink({
    solicitanteUid: parsed.data.solicitanteUid,
    createdBy: user.id,
  });
  return { error: null, token };
}
