import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { solicitacao } from "@/db/schema";
import type { Etapa, Solicitacao, Status } from "@/app/data";

function rowToSolicitacao(
  row: typeof solicitacao.$inferSelect,
): Solicitacao {
  return {
    uid: row.uid,
    id: String(row.id),
    organizacaoId: row.organizacaoUid,
    nome: row.nome,
    nota: row.nota,
    etapa: row.etapa as Etapa,
    status: row.status as Status,
    url: row.url,
  };
}

export async function listSolicitacoesByOrg(
  organizacaoUid: string,
): Promise<Solicitacao[]> {
  const rows = await db
    .select()
    .from(solicitacao)
    .where(
      and(
        eq(solicitacao.organizacaoUid, organizacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .orderBy(desc(solicitacao.id));
  return rows.map(rowToSolicitacao);
}

export async function getSolicitacaoByOrgAndHumanId(
  organizacaoUid: string,
  humanId: number,
): Promise<Solicitacao | undefined> {
  const [row] = await db
    .select()
    .from(solicitacao)
    .where(
      and(
        eq(solicitacao.organizacaoUid, organizacaoUid),
        eq(solicitacao.id, humanId),
        isNull(solicitacao.deletedAt),
      ),
    )
    .limit(1);
  return row ? rowToSolicitacao(row) : undefined;
}

export async function getSolicitacaoByUid(
  uid: string,
): Promise<Solicitacao | undefined> {
  const [row] = await db
    .select()
    .from(solicitacao)
    .where(and(eq(solicitacao.uid, uid), isNull(solicitacao.deletedAt)))
    .limit(1);
  return row ? rowToSolicitacao(row) : undefined;
}

async function nextIdForOrg(organizacaoUid: string): Promise<number> {
  const [last] = await db
    .select({ id: solicitacao.id })
    .from(solicitacao)
    .where(eq(solicitacao.organizacaoUid, organizacaoUid))
    .orderBy(desc(solicitacao.id))
    .limit(1);
  // Começa em 2050 como o mock, só pra não parecer novíssimo
  return (last?.id ?? 2049) + 1;
}

type CreateSolicitacaoInput = {
  organizacaoUid: string;
  nome: string;
  nota?: string;
  url?: string;
  createdBy?: string;
};

export async function createSolicitacao(
  input: CreateSolicitacaoInput,
): Promise<Solicitacao> {
  const uid = crypto.randomUUID();
  const id = await nextIdForOrg(input.organizacaoUid);
  await db.insert(solicitacao).values({
    uid,
    id,
    organizacaoUid: input.organizacaoUid,
    nome: input.nome,
    nota: input.nota ?? "",
    url: input.url ?? "",
    createdBy: input.createdBy,
  });
  const created = await getSolicitacaoByUid(uid);
  if (!created) throw new Error("Failed to create solicitacao");
  return created;
}

type UpdateSolicitacaoInput = Partial<{
  nome: string;
  nota: string;
  url: string;
  etapa: Etapa;
  status: Status;
}>;

export async function updateSolicitacao(
  uid: string,
  input: UpdateSolicitacaoInput,
): Promise<void> {
  await db
    .update(solicitacao)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(solicitacao.uid, uid));
}

/** Soft delete — preserva histórico, mas oculta de listas. */
export async function archiveSolicitacao(uid: string): Promise<void> {
  await db
    .update(solicitacao)
    .set({ deletedAt: new Date() })
    .where(eq(solicitacao.uid, uid));
}

/** Desfaz archive. */
export async function unarchiveSolicitacao(uid: string): Promise<void> {
  await db
    .update(solicitacao)
    .set({ deletedAt: null })
    .where(eq(solicitacao.uid, uid));
}

/** Hard delete — remove a solicitação e cascateia solicitantes/share links. */
export async function deleteSolicitacao(uid: string): Promise<void> {
  await db.delete(solicitacao).where(eq(solicitacao.uid, uid));
}
