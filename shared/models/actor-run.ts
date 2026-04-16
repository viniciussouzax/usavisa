import "server-only";
import { randomUUID } from "crypto";
import { eq, and, lte, desc } from "drizzle-orm";
import { db } from "@/db";
import { actorRun } from "@/db/schema";

export type ActorRunRow = typeof actorRun.$inferSelect;

type CreateInput = {
  solicitanteUid: string;
  subEtapa: string;
  actorId: string;
  tentativa?: number;
  applicationId?: string;
  agendadoPara?: Date;
};

export async function createActorRun(input: CreateInput): Promise<string> {
  const id = randomUUID();
  await db.insert(actorRun).values({
    id,
    solicitanteUid: input.solicitanteUid,
    subEtapa: input.subEtapa,
    actorId: input.actorId,
    tentativa: input.tentativa ?? 1,
    status: input.agendadoPara ? "Agendado" : "Pendente",
    applicationId: input.applicationId,
    agendadoPara: input.agendadoPara,
  });
  return id;
}

export async function updateActorRun(
  id: string,
  data: Partial<typeof actorRun.$inferInsert>,
): Promise<void> {
  await db
    .update(actorRun)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(actorRun.id, id));
}

export async function getActorRun(id: string): Promise<ActorRunRow | undefined> {
  const [row] = await db.select().from(actorRun).where(eq(actorRun.id, id)).limit(1);
  return row;
}

export async function getLatestActorRun(
  solicitanteUid: string,
  subEtapa?: string,
): Promise<ActorRunRow | undefined> {
  const conditions = [eq(actorRun.solicitanteUid, solicitanteUid)];
  if (subEtapa) conditions.push(eq(actorRun.subEtapa, subEtapa));
  const [row] = await db
    .select()
    .from(actorRun)
    .where(and(...conditions))
    .orderBy(desc(actorRun.createdAt))
    .limit(1);
  return row;
}

export async function listActorRuns(solicitanteUid: string): Promise<ActorRunRow[]> {
  return db
    .select()
    .from(actorRun)
    .where(eq(actorRun.solicitanteUid, solicitanteUid))
    .orderBy(desc(actorRun.createdAt));
}

export async function getRunsToExecute(): Promise<ActorRunRow[]> {
  const now = new Date();
  return db
    .select()
    .from(actorRun)
    .where(
      and(
        eq(actorRun.status, "Agendado"),
        lte(actorRun.agendadoPara, now),
      ),
    );
}

export async function getRunsInProgress(): Promise<ActorRunRow[]> {
  return db
    .select()
    .from(actorRun)
    .where(eq(actorRun.status, "Executando"));
}
