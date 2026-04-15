import { ArrowLeft, LifeBuoy, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";
import { buildWhatsAppUrl } from "@/app/data";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { resolveShareToken } from "@/shared/models/share-link";
import { listSolicitantesBySolicitacao } from "@/shared/models/solicitante";
import { getFormDataForSolicitante } from "@/shared/models/form-data";
import { EngineHost } from "@/shared/form-engine/renderer/EngineHost";

export default async function CaseSolicitanteFormPage({
  params,
}: {
  params: Promise<{ shortId: string; token: string; applicantUid: string }>;
}) {
  const { shortId, token, applicantUid } = await params;

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const resolved = await resolveShareToken(token);
  if (!resolved || resolved.solicitacao.organizacaoId !== organizacao.uid) {
    redirect(`/${shortId}`);
  }

  const solicitantes = await listSolicitantesBySolicitacao(
    resolved.solicitacao.uid,
  );
  const solicitante = solicitantes.find((s) => s.id === applicantUid);
  if (!solicitante) redirect(`/${shortId}/${token}`);

  const initialFormSnapshot = await getFormDataForSolicitante(solicitante.id);

  const supportUrl = buildWhatsAppUrl(
    organizacao.whatsapp,
    `Olá, preciso de ajuda para preencher o formulário de ${solicitante.nome}.`,
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <OrganizacaoLogo organizacao={organizacao} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {organizacao.nome}
              </span>
              <span className="text-xs text-muted-foreground">
                Assessoria de vistos
              </span>
            </div>
          </div>

          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            <LifeBuoy className="h-4 w-4" />
            <span className="hidden sm:inline">Suporte</span>
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href={`/${shortId}/${token}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à lista
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium">
            #{solicitante.ordem}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {solicitante.nome}
            </h1>
            <p className="text-sm text-muted-foreground">
              {solicitante.parentesco}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <EngineHost
            solicitanteUid={solicitante.id}
            token={token}
            initialSnapshot={initialFormSnapshot}
            mode="pages"
          />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Seus dados são usados apenas para a solicitação junto à{" "}
            {organizacao.nome}.
          </p>
        </div>
      </section>
    </main>
  );
}
