import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { solicitante } from "@/db/schema";
import type { Etapa, Solicitante, Status } from "@/app/data";

function rowToSolicitante(
  row: typeof solicitante.$inferSelect,
): Solicitante {
  return {
    id: row.uid,
    ordem: row.ordem,
    nome: row.nome,
    parentesco: row.parentesco as Solicitante["parentesco"],
    cpf: row.cpf,
    etapa: row.etapa as Etapa,
    status: row.status as Status,
  };
}

export async function listSolicitantesBySolicitacao(
  solicitacaoUid: string,
): Promise<Solicitante[]> {
  const rows = await db
    .select()
    .from(solicitante)
    .where(eq(solicitante.solicitacaoUid, solicitacaoUid))
    .orderBy(asc(solicitante.ordem));
  return rows.map(rowToSolicitante);
}

export async function getSolicitanteByUid(
  uid: string,
): Promise<Solicitante | undefined> {
  const [row] = await db
    .select()
    .from(solicitante)
    .where(eq(solicitante.uid, uid))
    .limit(1);
  return row ? rowToSolicitante(row) : undefined;
}

async function nextOrdemForSolicitacao(
  solicitacaoUid: string,
): Promise<number> {
  const [last] = await db
    .select({ ordem: solicitante.ordem })
    .from(solicitante)
    .where(eq(solicitante.solicitacaoUid, solicitacaoUid))
    .orderBy(desc(solicitante.ordem))
    .limit(1);
  return (last?.ordem ?? 0) + 1;
}

type CreateSolicitanteInput = {
  solicitacaoUid: string;
  nome: string;
  parentesco: Solicitante["parentesco"];
  cpf?: string;
};

export async function createSolicitante(
  input: CreateSolicitanteInput,
): Promise<Solicitante> {
  const uid = crypto.randomUUID();
  const ordem =
    input.parentesco === "Titular"
      ? 1
      : await nextOrdemForSolicitacao(input.solicitacaoUid);
  await db.insert(solicitante).values({
    uid,
    solicitacaoUid: input.solicitacaoUid,
    ordem,
    nome: input.nome,
    parentesco: input.parentesco,
    cpf: input.cpf ?? "",
  });
  const created = await getSolicitanteByUid(uid);
  if (!created) throw new Error("Failed to create solicitante");
  return created;
}

export async function updateSolicitanteDadosExtras(
  uid: string,
  dados: Record<string, string>,
): Promise<void> {
  await db
    .update(solicitante)
    .set({ dadosExtras: dados, updatedAt: new Date() })
    .where(eq(solicitante.uid, uid));
}

type UpdateSolicitanteInput = Partial<{
  nome: string;
  parentesco: Solicitante["parentesco"];
  cpf: string;
  etapa: Etapa;
  status: Status;
}>;

export async function updateSolicitante(
  uid: string,
  input: UpdateSolicitanteInput,
): Promise<void> {
  await db
    .update(solicitante)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(solicitante.uid, uid));
}

export async function deleteSolicitante(uid: string): Promise<void> {
  await db.delete(solicitante).where(eq(solicitante.uid, uid));
}
