import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUser } from "@/lib/auth";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { db } from "@/db";
import { organizacao } from "@/db/schema";
import { eq } from "drizzle-orm";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"]);
const VALID_FIELDS = new Set(["logoLight", "logoDark", "iconLight", "iconDark"]);

export async function POST(req: NextRequest) {
  const organizacaoUid = req.nextUrl.searchParams.get("organizacaoUid");
  const field = req.nextUrl.searchParams.get("field");

  if (!organizacaoUid || !field || !VALID_FIELDS.has(field)) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { user } = await getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (!isMaster(user.role)) {
    const m = await getAssessorByUserAndOrg(user.id, organizacaoUid);
    if (!m?.ativo || !["owner", "admin"].includes(m.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo excede 2 MB" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formato não suportado (use JPG, PNG, SVG ou WebP)" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob não configurado" }, { status: 500 });
  }

  const blob = await put(
    `org-logos/${organizacaoUid}/${field}-${Date.now()}.${file.name.split(".").pop()}`,
    file,
    { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN },
  );

  await db
    .update(organizacao)
    .set({ [field]: blob.url, updatedAt: new Date() })
    .where(eq(organizacao.uid, organizacaoUid));

  return NextResponse.json({ url: blob.url, field });
}
