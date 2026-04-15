import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { assessor, user } from "@/db/schema";
import type { Assessor, AssessorRole } from "@/app/data";

type RawAssessor = {
  id: string;
  userId: string;
  organizacaoUid: string;
  role: string;
  ativo: boolean;
  createdAt: Date;
  userName: string | null;
  userEmail: string;
};

function toAssessor(r: RawAssessor): Assessor {
  return {
    id: r.id,
    nome: r.userName ?? r.userEmail.split("@")[0] ?? r.userEmail,
    email: r.userEmail,
    role: r.role as AssessorRole,
    organizacaoUid: r.organizacaoUid,
    ativo: r.ativo,
    criadoEm: r.createdAt.toISOString(),
  };
}

export async function getAssessoresByOrg(
  organizacaoUid: string,
): Promise<Assessor[]> {
  const rows = await db
    .select({
      id: assessor.id,
      userId: assessor.userId,
      organizacaoUid: assessor.organizacaoUid,
      role: assessor.role,
      ativo: assessor.ativo,
      createdAt: assessor.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(assessor)
    .innerJoin(user, eq(user.id, assessor.userId))
    .where(eq(assessor.organizacaoUid, organizacaoUid))
    .orderBy(assessor.createdAt);
  return rows.map(toAssessor);
}

export async function getAssessorByUserAndOrg(
  userId: string,
  organizacaoUid: string,
): Promise<Assessor | undefined> {
  const [row] = await db
    .select({
      id: assessor.id,
      userId: assessor.userId,
      organizacaoUid: assessor.organizacaoUid,
      role: assessor.role,
      ativo: assessor.ativo,
      createdAt: assessor.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(assessor)
    .innerJoin(user, eq(user.id, assessor.userId))
    .where(
      and(
        eq(assessor.userId, userId),
        eq(assessor.organizacaoUid, organizacaoUid),
      ),
    )
    .limit(1);
  return row ? toAssessor(row) : undefined;
}

export async function getPrimaryOrgUidForUser(
  userId: string,
): Promise<string | undefined> {
  const [row] = await db
    .select({ organizacaoUid: assessor.organizacaoUid })
    .from(assessor)
    .where(and(eq(assessor.userId, userId), eq(assessor.ativo, true)))
    .orderBy(assessor.createdAt)
    .limit(1);
  return row?.organizacaoUid;
}

type AddAssessorInput = {
  userId: string;
  organizacaoUid: string;
  role: AssessorRole;
};

export async function addAssessor(input: AddAssessorInput): Promise<void> {
  await db.insert(assessor).values({
    id: crypto.randomUUID(),
    userId: input.userId,
    organizacaoUid: input.organizacaoUid,
    role: input.role,
    ativo: true,
  });
}

export async function updateAssessor(
  id: string,
  input: Partial<Pick<Assessor, "role" | "ativo">>,
): Promise<void> {
  await db
    .update(assessor)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(assessor.id, id));
}

export async function getAssessorById(
  id: string,
): Promise<Assessor | undefined> {
  const [row] = await db
    .select({
      id: assessor.id,
      userId: assessor.userId,
      organizacaoUid: assessor.organizacaoUid,
      role: assessor.role,
      ativo: assessor.ativo,
      createdAt: assessor.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(assessor)
    .innerJoin(user, eq(user.id, assessor.userId))
    .where(eq(assessor.id, id))
    .limit(1);
  return row ? toAssessor(row) : undefined;
}

/**
 * Remove o vínculo assessor ↔ org. Mantém o usuário no banco — pode ter
 * vínculos com outras orgs, ou ser re-adicionado depois.
 */
export async function removeAssessor(id: string): Promise<void> {
  await db.delete(assessor).where(eq(assessor.id, id));
}
