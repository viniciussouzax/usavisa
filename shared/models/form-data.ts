import "server-only";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { formData, formLog } from "@/db/schema";

export type FormDataSnapshot = {
  data: Record<string, unknown>;
  arrayData: Record<string, unknown[]>;
  visitedSections: string[];
  naFields: string[];
  unknownFields: string[];
  updatedAt: Date | null;
};

const EMPTY_SNAPSHOT: FormDataSnapshot = {
  data: {},
  arrayData: {},
  visitedSections: [],
  naFields: [],
  unknownFields: [],
  updatedAt: null,
};

export async function getFormDataForSolicitante(
  solicitanteUid: string,
): Promise<FormDataSnapshot> {
  const [row] = await db
    .select()
    .from(formData)
    .where(eq(formData.solicitanteUid, solicitanteUid))
    .limit(1);
  if (!row) return EMPTY_SNAPSHOT;
  return {
    data: row.data,
    arrayData: row.arrayData,
    visitedSections: row.visitedSections,
    naFields: row.naFields,
    unknownFields: row.unknownFields,
    updatedAt: row.updatedAt,
  };
}

export async function saveFormDataForSolicitante(
  solicitanteUid: string,
  snapshot: Omit<FormDataSnapshot, "updatedAt">,
): Promise<void> {
  const existing = await db
    .select({ uid: formData.solicitanteUid })
    .from(formData)
    .where(eq(formData.solicitanteUid, solicitanteUid))
    .limit(1);
  const now = new Date();
  if (existing.length) {
    await db
      .update(formData)
      .set({
        data: snapshot.data,
        arrayData: snapshot.arrayData,
        visitedSections: snapshot.visitedSections,
        naFields: snapshot.naFields,
        unknownFields: snapshot.unknownFields,
        updatedAt: now,
      })
      .where(eq(formData.solicitanteUid, solicitanteUid));
    return;
  }
  await db.insert(formData).values({
    solicitanteUid,
    data: snapshot.data,
    arrayData: snapshot.arrayData,
    visitedSections: snapshot.visitedSections,
    naFields: snapshot.naFields,
    unknownFields: snapshot.unknownFields,
    updatedAt: now,
  });
}

type LogInput = {
  solicitanteUid: string;
  event: string;
  payload?: Record<string, unknown>;
};

export async function appendFormLog(input: LogInput): Promise<void> {
  await db.insert(formLog).values({
    id: randomUUID(),
    solicitanteUid: input.solicitanteUid,
    event: input.event,
    payload: input.payload ?? {},
  });
}
