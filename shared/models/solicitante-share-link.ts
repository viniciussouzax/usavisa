import "server-only";
import { randomBytes } from "crypto";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { solicitacao, solicitante, solicitanteShareLink } from "@/db/schema";
import type { Solicitante, Solicitacao } from "@/app/data";

type ShareResolution = {
  solicitante: Solicitante;
  solicitacao: Solicitacao;
  accessCount: number;
};

function validLinkWhere(token: string) {
  return and(
    eq(solicitanteShareLink.token, token),
    isNull(solicitanteShareLink.revokedAt),
    or(
      isNull(solicitanteShareLink.expiresAt),
      gt(solicitanteShareLink.expiresAt, new Date()),
    ),
  );
}

export async function resolveSolicitanteShareToken(
  token: string,
): Promise<ShareResolution | undefined> {
  const [row] = await db
    .select({
      token: solicitanteShareLink.token,
      accessCount: solicitanteShareLink.accessCount,
      sol: solicitante,
      caso: solicitacao,
    })
    .from(solicitanteShareLink)
    .innerJoin(
      solicitante,
      eq(solicitante.uid, solicitanteShareLink.solicitanteUid),
    )
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(validLinkWhere(token))
    .limit(1);
  if (!row) return undefined;

  // Best-effort — não bloqueia render.
  db.update(solicitanteShareLink)
    .set({ accessCount: row.accessCount + 1 })
    .where(eq(solicitanteShareLink.token, token))
    .catch(() => undefined);

  return {
    solicitante: {
      id: row.sol.uid,
      ordem: row.sol.ordem,
      nome: row.sol.nome,
      parentesco: row.sol.parentesco as Solicitante["parentesco"],
      cpf: row.sol.cpf,
      etapa: row.sol.etapa as Solicitante["etapa"],
      status: row.sol.status as Solicitante["status"],
    },
    solicitacao: {
      uid: row.caso.uid,
      id: String(row.caso.id),
      organizacaoId: row.caso.organizacaoUid,
      nome: row.caso.nome,
      nota: row.caso.nota,
      etapa: row.caso.etapa as Solicitacao["etapa"],
      status: row.caso.status as Solicitacao["status"],
      url: row.caso.url,
    },
    accessCount: row.accessCount + 1,
  };
}

export type SolicitanteShareTokenStatus =
  | { kind: "not-found" }
  | {
      kind: "revoked" | "expired";
      solicitanteUid: string;
      organizacaoUid: string;
    };

export async function getSolicitanteShareTokenStatus(
  token: string,
): Promise<SolicitanteShareTokenStatus> {
  const [row] = await db
    .select({
      revokedAt: solicitanteShareLink.revokedAt,
      expiresAt: solicitanteShareLink.expiresAt,
      solicitanteUid: solicitanteShareLink.solicitanteUid,
      organizacaoUid: solicitacao.organizacaoUid,
    })
    .from(solicitanteShareLink)
    .innerJoin(
      solicitante,
      eq(solicitante.uid, solicitanteShareLink.solicitanteUid),
    )
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitanteShareLink.token, token))
    .limit(1);
  if (!row) return { kind: "not-found" };
  if (row.revokedAt !== null) {
    return {
      kind: "revoked",
      solicitanteUid: row.solicitanteUid,
      organizacaoUid: row.organizacaoUid,
    };
  }
  if (row.expiresAt && row.expiresAt <= new Date()) {
    return {
      kind: "expired",
      solicitanteUid: row.solicitanteUid,
      organizacaoUid: row.organizacaoUid,
    };
  }
  return { kind: "not-found" };
}

export type LatestSolicitanteShareLink = {
  token: string;
  revoked: boolean;
  expiresAt: Date | null;
  accessCount: number;
};

export async function getLatestShareLinkForSolicitante(
  solicitanteUid: string,
): Promise<LatestSolicitanteShareLink | undefined> {
  const [row] = await db
    .select({
      token: solicitanteShareLink.token,
      revokedAt: solicitanteShareLink.revokedAt,
      expiresAt: solicitanteShareLink.expiresAt,
      accessCount: solicitanteShareLink.accessCount,
    })
    .from(solicitanteShareLink)
    .where(eq(solicitanteShareLink.solicitanteUid, solicitanteUid))
    .orderBy(desc(solicitanteShareLink.createdAt))
    .limit(1);
  if (!row) return undefined;
  return {
    token: row.token,
    revoked: row.revokedAt !== null,
    expiresAt: row.expiresAt,
    accessCount: row.accessCount,
  };
}

type CreateInput = {
  solicitanteUid: string;
  createdBy?: string;
  expiresAt?: Date;
};

export async function createSolicitanteShareLink(
  input: CreateInput,
): Promise<string> {
  const token = randomBytes(8).toString("hex");
  await db.insert(solicitanteShareLink).values({
    token,
    solicitanteUid: input.solicitanteUid,
    createdBy: input.createdBy,
    expiresAt: input.expiresAt,
  });
  return token;
}

export async function revokeSolicitanteShareLink(
  token: string,
): Promise<void> {
  await db
    .update(solicitanteShareLink)
    .set({ revokedAt: new Date() })
    .where(eq(solicitanteShareLink.token, token));
}

export async function reactivateSolicitanteShareLink(
  token: string,
): Promise<void> {
  await db
    .update(solicitanteShareLink)
    .set({ revokedAt: null })
    .where(eq(solicitanteShareLink.token, token));
}
