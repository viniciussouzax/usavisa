import "server-only";
import { randomBytes } from "crypto";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { shareLink, solicitacao } from "@/db/schema";
import type { Solicitacao } from "@/app/data";

type ShareResolution = {
  solicitacao: Solicitacao;
  accessCount: number;
};

function validLinkWhere(token: string) {
  return and(
    eq(shareLink.token, token),
    isNull(shareLink.revokedAt),
    or(isNull(shareLink.expiresAt), gt(shareLink.expiresAt, new Date())),
  );
}

export type ShareTokenStatus =
  | { kind: "not-found" }
  | { kind: "revoked"; solicitacaoUid: string; organizacaoUid: string }
  | { kind: "expired"; solicitacaoUid: string; organizacaoUid: string };

/**
 * Verifica o status de um token mesmo quando inválido — útil pra mostrar
 * tela amigável de "link encerrado" em vez de redirect silencioso.
 */
export async function getShareTokenStatus(
  token: string,
): Promise<ShareTokenStatus> {
  const [row] = await db
    .select({
      revokedAt: shareLink.revokedAt,
      expiresAt: shareLink.expiresAt,
      solicitacaoUid: shareLink.solicitacaoUid,
      organizacaoUid: solicitacao.organizacaoUid,
    })
    .from(shareLink)
    .innerJoin(solicitacao, eq(solicitacao.uid, shareLink.solicitacaoUid))
    .where(and(eq(shareLink.token, token), isNull(solicitacao.deletedAt)))
    .limit(1);
  if (!row) return { kind: "not-found" };
  if (row.revokedAt !== null) {
    return {
      kind: "revoked",
      solicitacaoUid: row.solicitacaoUid,
      organizacaoUid: row.organizacaoUid,
    };
  }
  if (row.expiresAt && row.expiresAt <= new Date()) {
    return {
      kind: "expired",
      solicitacaoUid: row.solicitacaoUid,
      organizacaoUid: row.organizacaoUid,
    };
  }
  return { kind: "not-found" };
}

export async function resolveShareToken(
  token: string,
): Promise<ShareResolution | undefined> {
  const [row] = await db
    .select({
      token: shareLink.token,
      solicitacaoUid: shareLink.solicitacaoUid,
      accessCount: shareLink.accessCount,
      sol: solicitacao,
    })
    .from(shareLink)
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, shareLink.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(validLinkWhere(token))
    .limit(1);
  if (!row) return undefined;

  // Best-effort access counter. Sem bloquear o render em caso de erro.
  db.update(shareLink)
    .set({ accessCount: row.accessCount + 1 })
    .where(eq(shareLink.token, token))
    .catch(() => undefined);

  return {
    solicitacao: {
      uid: row.sol.uid,
      id: String(row.sol.id),
      organizacaoId: row.sol.organizacaoUid,
      nome: row.sol.nome,
      nota: row.sol.nota,
      etapa: row.sol.etapa as Solicitacao["etapa"],
      status: row.sol.status as Solicitacao["status"],
      url: row.sol.url,
    },
    accessCount: row.accessCount + 1,
  };
}

export async function getActiveTokenForSolicitacao(
  solicitacaoUid: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ token: shareLink.token })
    .from(shareLink)
    .where(
      and(
        eq(shareLink.solicitacaoUid, solicitacaoUid),
        isNull(shareLink.revokedAt),
      ),
    )
    .orderBy(desc(shareLink.createdAt))
    .limit(1);
  return row?.token;
}

export type LatestShareLink = {
  token: string;
  revoked: boolean;
  expiresAt: Date | null;
  accessCount: number;
};

export async function getLatestShareLinkForSolicitacao(
  solicitacaoUid: string,
): Promise<LatestShareLink | undefined> {
  const [row] = await db
    .select({
      token: shareLink.token,
      revokedAt: shareLink.revokedAt,
      expiresAt: shareLink.expiresAt,
      accessCount: shareLink.accessCount,
    })
    .from(shareLink)
    .where(eq(shareLink.solicitacaoUid, solicitacaoUid))
    .orderBy(desc(shareLink.createdAt))
    .limit(1);
  if (!row) return undefined;
  return {
    token: row.token,
    revoked: row.revokedAt !== null,
    expiresAt: row.expiresAt,
    accessCount: row.accessCount,
  };
}

type CreateShareLinkInput = {
  solicitacaoUid: string;
  createdBy?: string;
  expiresAt?: Date;
};

export async function createShareLink(
  input: CreateShareLinkInput,
): Promise<string> {
  const token = randomBytes(8).toString("hex"); // 16 chars hex
  await db.insert(shareLink).values({
    token,
    solicitacaoUid: input.solicitacaoUid,
    createdBy: input.createdBy,
    expiresAt: input.expiresAt,
  });
  return token;
}

export async function revokeShareLink(token: string): Promise<void> {
  await db
    .update(shareLink)
    .set({ revokedAt: new Date() })
    .where(eq(shareLink.token, token));
}

export async function reactivateShareLink(token: string): Promise<void> {
  await db
    .update(shareLink)
    .set({ revokedAt: null })
    .where(eq(shareLink.token, token));
}
