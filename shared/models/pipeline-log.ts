import "server-only";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { pipelineLog } from "@/db/schema";

export type PipelineLogEntry = typeof pipelineLog.$inferSelect;

type LogInput = {
  solicitanteUid: string;
  evento: string;
  subEtapa?: string;
  tarefa?: string;
  status?: string;
  dados?: Record<string, unknown>;
  duracaoMs?: number;
};

export async function appendPipelineLog(input: LogInput): Promise<void> {
  await db.insert(pipelineLog).values({
    id: randomUUID(),
    solicitanteUid: input.solicitanteUid,
    evento: input.evento,
    subEtapa: input.subEtapa,
    tarefa: input.tarefa,
    status: input.status,
    dados: input.dados ?? {},
    duracaoMs: input.duracaoMs,
  });
}

export async function getPipelineLogs(
  solicitanteUid: string,
): Promise<PipelineLogEntry[]> {
  return db
    .select()
    .from(pipelineLog)
    .where(eq(pipelineLog.solicitanteUid, solicitanteUid))
    .orderBy(desc(pipelineLog.createdAt));
}
