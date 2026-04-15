import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { organizacao, solicitacao, assessor } from "@/db/schema";
import type { Organizacao, Plano } from "@/app/data";

function rowToOrganizacao(row: typeof organizacao.$inferSelect): Organizacao {
  return {
    uid: row.uid,
    id: row.id,
    shortId: row.shortId,
    nome: row.nome,
    whatsapp: row.whatsapp,
    logoLight: row.logoLight,
    logoDark: row.logoDark,
    iconLight: row.iconLight,
    iconDark: row.iconDark,
    color1: row.color1,
    color2: row.color2,
    color3: row.color3,
    fontTitle: row.fontTitle,
    fontBody: row.fontBody,
    ativa: row.ativa,
    plano: row.plano as Plano,
    tagline: row.tagline,
    descricao: row.descricao,
    footerText: row.footerText,
  };
}

export async function listOrganizacoes(): Promise<Organizacao[]> {
  const rows = await db
    .select()
    .from(organizacao)
    .where(isNull(organizacao.deletedAt))
    .orderBy(organizacao.id);
  return rows.map(rowToOrganizacao);
}

export async function getOrganizacaoByShortId(
  shortId: string,
): Promise<Organizacao | undefined> {
  const [row] = await db
    .select()
    .from(organizacao)
    .where(and(eq(organizacao.shortId, shortId), isNull(organizacao.deletedAt)))
    .limit(1);
  return row ? rowToOrganizacao(row) : undefined;
}

export async function getOrganizacaoByUid(
  uid: string,
): Promise<Organizacao | undefined> {
  const [row] = await db
    .select()
    .from(organizacao)
    .where(and(eq(organizacao.uid, uid), isNull(organizacao.deletedAt)))
    .limit(1);
  return row ? rowToOrganizacao(row) : undefined;
}

export async function countSolicitacoesByOrg(
  organizacaoUid: string,
): Promise<number> {
  const rows = await db
    .select({ uid: solicitacao.uid })
    .from(solicitacao)
    .where(
      and(
        eq(solicitacao.organizacaoUid, organizacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    );
  return rows.length;
}

export async function countAssessoresByOrg(
  organizacaoUid: string,
): Promise<number> {
  const rows = await db
    .select({ id: assessor.id })
    .from(assessor)
    .where(eq(assessor.organizacaoUid, organizacaoUid));
  return rows.length;
}

async function nextOrgId(): Promise<number> {
  const [last] = await db
    .select({ id: organizacao.id })
    .from(organizacao)
    .orderBy(desc(organizacao.id))
    .limit(1);
  return (last?.id ?? 0) + 1;
}

type CreateOrganizacaoInput = {
  shortId: string;
  nome: string;
  whatsapp: string;
  plano?: Plano;
};

export async function createOrganizacao(
  input: CreateOrganizacaoInput,
): Promise<Organizacao> {
  const uid = crypto.randomUUID();
  const id = await nextOrgId();
  await db.insert(organizacao).values({
    uid,
    id,
    shortId: input.shortId,
    nome: input.nome,
    whatsapp: input.whatsapp,
    plano: input.plano ?? "free",
  });
  const created = await getOrganizacaoByUid(uid);
  if (!created) throw new Error("Failed to create organizacao");
  return created;
}

type UpdateOrganizacaoInput = Partial<
  Pick<
    Organizacao,
    | "shortId"
    | "nome"
    | "whatsapp"
    | "logoLight"
    | "logoDark"
    | "iconLight"
    | "iconDark"
    | "color1"
    | "color2"
    | "color3"
    | "fontTitle"
    | "fontBody"
    | "ativa"
    | "plano"
    | "tagline"
    | "descricao"
    | "footerText"
  >
>;

export async function updateOrganizacao(
  uid: string,
  input: UpdateOrganizacaoInput,
): Promise<void> {
  await db
    .update(organizacao)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizacao.uid, uid));
}
