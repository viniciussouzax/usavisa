import "server-only";
import { randomUUID } from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orgPublicLink } from "@/db/schema";

export type OrgPublicLink = {
  id: string;
  organizacaoUid: string;
  label: string;
  descricao: string | null;
  url: string;
  icon: string | null;
  ordem: number;
  ativo: boolean;
};

function toDto(row: typeof orgPublicLink.$inferSelect): OrgPublicLink {
  return {
    id: row.id,
    organizacaoUid: row.organizacaoUid,
    label: row.label,
    descricao: row.descricao,
    url: row.url,
    icon: row.icon,
    ordem: row.ordem,
    ativo: row.ativo,
  };
}

export async function listPublicLinksByOrg(
  organizacaoUid: string,
): Promise<OrgPublicLink[]> {
  const rows = await db
    .select()
    .from(orgPublicLink)
    .where(eq(orgPublicLink.organizacaoUid, organizacaoUid))
    .orderBy(asc(orgPublicLink.ordem), asc(orgPublicLink.createdAt));
  return rows.map(toDto);
}

export async function listActivePublicLinksByOrg(
  organizacaoUid: string,
): Promise<OrgPublicLink[]> {
  const all = await listPublicLinksByOrg(organizacaoUid);
  return all.filter((l) => l.ativo);
}

type CreateInput = {
  organizacaoUid: string;
  label: string;
  url: string;
  descricao?: string;
  icon?: string;
};

export async function createPublicLink(input: CreateInput): Promise<OrgPublicLink> {
  // Nova entrada vai pro fim da lista
  const existing = await listPublicLinksByOrg(input.organizacaoUid);
  const ordem = existing.length;
  const id = randomUUID();
  await db.insert(orgPublicLink).values({
    id,
    organizacaoUid: input.organizacaoUid,
    label: input.label,
    url: input.url,
    descricao: input.descricao ?? null,
    icon: input.icon ?? null,
    ordem,
    ativo: true,
  });
  const [row] = await db
    .select()
    .from(orgPublicLink)
    .where(eq(orgPublicLink.id, id))
    .limit(1);
  return toDto(row);
}

type UpdateInput = Partial<
  Pick<OrgPublicLink, "label" | "descricao" | "url" | "icon" | "ativo" | "ordem">
>;

export async function updatePublicLink(
  id: string,
  input: UpdateInput,
): Promise<void> {
  await db
    .update(orgPublicLink)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(orgPublicLink.id, id));
}

export async function deletePublicLink(id: string): Promise<void> {
  await db.delete(orgPublicLink).where(eq(orgPublicLink.id, id));
}

export async function reorderPublicLinks(
  organizacaoUid: string,
  orderedIds: string[],
): Promise<void> {
  // Rewrite ordem em batch — evita buracos na sequência.
  await Promise.all(
    orderedIds.map((id, idx) =>
      db
        .update(orgPublicLink)
        .set({ ordem: idx, updatedAt: new Date() })
        .where(eq(orgPublicLink.id, id)),
    ),
  );
  // Marca org como atualizada sinalizando mudança (noop se não usado).
  void organizacaoUid;
}
