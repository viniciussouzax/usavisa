"use server";

import { z } from "zod";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import {
  appendFormLog,
  saveFormDataForSolicitante,
} from "@/shared/models/form-data";
import { resolveShareToken } from "@/shared/models/share-link";
import { resolveSolicitanteShareToken } from "@/shared/models/solicitante-share-link";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const schema = z.object({
  solicitanteUid: z.string().min(1),
  /** Opcional — se presente, autoriza acesso público (case ou applicant token). */
  token: z.string().optional(),
  snapshot: z.object({
    data: z.record(z.string(), z.unknown()),
    arrayData: z.record(z.string(), z.array(z.unknown())),
    visitedSections: z.array(z.string()),
    naFields: z.array(z.string()),
    unknownFields: z.array(z.string()),
  }),
});

type Input = z.input<typeof schema>;
type Result = { error: string | null };

export async function saveFormDataAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { solicitanteUid, token, snapshot } = parsed.data;

  // Carrega solicitante + org pra validar ambos os fluxos (auth / token).
  const [row] = await db
    .select({
      organizacaoUid: solicitacao.organizacaoUid,
      solicitacaoUid: solicitacao.uid,
    })
    .from(solicitante)
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitante.uid, solicitanteUid))
    .limit(1);
  if (!row) return { error: "Solicitante não encontrado" };

  let authorized = false;

  // Fluxo 1: via token público
  if (token) {
    const asCase = await resolveShareToken(token);
    if (asCase && asCase.solicitacao.uid === row.solicitacaoUid) {
      authorized = true;
    } else {
      const asApplicant = await resolveSolicitanteShareToken(token);
      if (
        asApplicant &&
        asApplicant.solicitante.id === solicitanteUid
      ) {
        authorized = true;
      }
    }
  }

  // Fluxo 2: via sessão (assessor ou master)
  if (!authorized) {
    const { user } = await getUser();
    if (user) {
      if (isMaster(user.role)) {
        authorized = true;
      } else {
        const membership = await getAssessorByUserAndOrg(
          user.id,
          row.organizacaoUid,
        );
        if (membership?.ativo) authorized = true;
      }
    }
  }

  if (!authorized) return { error: "Sem permissão" };

  await saveFormDataForSolicitante(solicitanteUid, snapshot);
  await appendFormLog({
    solicitanteUid,
    event: "save",
    payload: {
      visitedSections: snapshot.visitedSections.length,
      naFields: snapshot.naFields.length,
      unknownFields: snapshot.unknownFields.length,
    },
  });

  return { error: null };
}
