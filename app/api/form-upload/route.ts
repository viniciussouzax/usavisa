import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUser } from "@/lib/auth";
import { getAssessorByUserAndOrg } from "@/shared/models/assessor";
import { isMaster } from "@/components/layout/nav-config";
import { resolveShareToken } from "@/shared/models/share-link";
import { resolveSolicitanteShareToken } from "@/shared/models/solicitante-share-link";
import { db } from "@/db";
import { solicitacao, solicitante } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const MAX_BYTES = 240 * 1024; // 240 KB (padrão CEAC)
const ALLOWED = new Set(["image/jpeg", "image/jpg"]);

async function authorize(
  solicitanteUid: string,
  token: string | null,
): Promise<boolean> {
  const [row] = await db
    .select({
      organizacaoUid: solicitacao.organizacaoUid,
      solicitacaoUid: solicitacao.uid,
    })
    .from(solicitante)
    .innerJoin(
      solicitacao,
      and(
        eq(solicitacao.uid, solicitante.solicitacaoUid),
        isNull(solicitacao.deletedAt),
      ),
    )
    .where(eq(solicitante.uid, solicitanteUid))
    .limit(1);
  if (!row) return false;

  if (token) {
    const asCase = await resolveShareToken(token);
    if (asCase && asCase.solicitacao.uid === row.solicitacaoUid) return true;
    const asApp = await resolveSolicitanteShareToken(token);
    if (asApp && asApp.solicitante.id === solicitanteUid) return true;
  }

  const { user } = await getUser();
  if (!user) return false;
  if (isMaster(user.role)) return true;
  const m = await getAssessorByUserAndOrg(user.id, row.organizacaoUid);
  return Boolean(m?.ativo);
}

export async function POST(req: NextRequest) {
  const solicitanteUid = req.nextUrl.searchParams.get("solicitanteUid");
  const token = req.nextUrl.searchParams.get("token");
  if (!solicitanteUid) {
    return NextResponse.json({ error: "solicitanteUid ausente" }, { status: 400 });
  }
  const ok = await authorize(solicitanteUid, token);
  if (!ok) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Arquivo excede ${MAX_BYTES / 1024} KB` },
      { status: 400 },
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Apenas imagens JPG são aceitas" },
      { status: 400 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob não configurado. Defina BLOB_READ_WRITE_TOKEN no ambiente.",
      },
      { status: 500 },
    );
  }

  const blob = await put(
    `ds160/${solicitanteUid}/${Date.now()}-${file.name}`,
    file,
    {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    },
  );
  return NextResponse.json({ url: blob.url });
}
