"use client";

import { LifeBuoy, ShieldCheck } from "lucide-react";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";
import {
  buildWhatsAppUrl,
  type Organizacao,
  type Solicitacao,
  type Solicitante,
} from "@/app/data";
import type { FormDataSnapshot } from "@/shared/models/form-data";
import { EngineHost } from "@/shared/form-engine/renderer/EngineHost";

type Props = {
  organizacao: Organizacao;
  solicitante: Solicitante;
  solicitacao: Solicitacao;
  token: string;
  initialFormSnapshot: FormDataSnapshot;
};

/**
 * Página pública acessada via token INDIVIDUAL do solicitante. Mostra só o
 * formulário dele — não menciona outros membros da solicitação.
 */
export function PublicSolicitanteClient({
  organizacao,
  solicitante,
  solicitacao,
  token,
  initialFormSnapshot,
}: Props) {
  const supportUrl = buildWhatsAppUrl(
    organizacao.whatsapp,
    `Olá, preciso de ajuda para preencher meu formulário na assessoria ${organizacao.nome}.`,
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
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Olá, {solicitante.nome.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha abaixo os dados necessários para o processamento do seu
            visto junto à {organizacao.nome}. Você pode salvar e voltar quando
            quiser.
          </p>
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
            Este link é pessoal e intransferível. Seus dados vinculam-se à
            solicitação &ldquo;{solicitacao.nome}&rdquo; e são usados apenas
            para sua solicitação junto à {organizacao.nome}.
          </p>
        </div>
      </section>
    </main>
  );
}
