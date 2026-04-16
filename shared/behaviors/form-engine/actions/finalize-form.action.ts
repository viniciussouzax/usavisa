"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
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
import { appendPipelineLog } from "@/shared/models/pipeline-log";

const schema = z.object({
  solicitanteUid: z.string().min(1),
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

/**
 * Finaliza o preenchimento: persiste o snapshot, muda o solicitante pra etapa
 * "Pronto para envio" e registra evento. O fluxo do DS-160 oficial no CEAC
 * é feito depois pelo actor de automação — esta action só sinaliza o estado
 * interno da plataforma.
 */
export async function finalizeFormAction(input: Input): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos" };

  const { solicitanteUid, token, snapshot } = parsed.data;

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
  if (token) {
    const asCase = await resolveShareToken(token);
    if (asCase && asCase.solicitacao.uid === row.solicitacaoUid) {
      authorized = true;
    } else {
      const asApp = await resolveSolicitanteShareToken(token);
      if (asApp && asApp.solicitante.id === solicitanteUid) authorized = true;
    }
  }
  if (!authorized) {
    const { user } = await getUser();
    if (user) {
      if (isMaster(user.role)) {
        authorized = true;
      } else {
        const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
        if (m?.ativo) authorized = true;
      }
    }
  }
  if (!authorized) return { error: "Sem permissão" };

  await saveFormDataForSolicitante(solicitanteUid, snapshot);

  // Triagem concluida: solicitante preencheu o formulario.
  // Etapa avanca pra Analise (assessor revisa estrategia antes de autorizar automacao).
  await db
    .update(solicitante)
    .set({
      etapa: "Analise",
      status: "Pendente",
      updatedAt: new Date(),
    })
    .where(eq(solicitante.uid, solicitanteUid));

  await appendFormLog({
    solicitanteUid,
    event: "finalize",
    payload: {
      visitedSections: snapshot.visitedSections.length,
    },
  });

  await appendPipelineLog({
    solicitanteUid,
    evento: "triagem.concluido",
    dados: { visitedSections: snapshot.visitedSections.length },
  });

  return { error: null };
}
