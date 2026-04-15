"use client";

import Link from "next/link";
import { ChevronRight, LifeBuoy, ShieldCheck } from "lucide-react";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  buildWhatsAppUrl,
  etapaTone,
  statusTone,
  type Organizacao,
  type Solicitacao,
  type Solicitante,
} from "@/app/data";

type Props = {
  organizacao: Organizacao;
  solicitacao: Solicitacao;
  solicitantes: Solicitante[];
  token: string;
};

export function PublicSolicitacaoClient({
  organizacao,
  solicitacao,
  solicitantes,
  token,
}: Props) {
  const shortId = organizacao.shortId;

  const supportUrl = buildWhatsAppUrl(
    organizacao.whatsapp,
    `Olá, preciso de ajuda com a solicitação "${solicitacao.nome}".`,
  );

  return (
    <main className="min-h-screen bg-background">
      {/*
        White-label: topo mostra APENAS a marca da organização e um contato
        de suporte dela. Sem menção à plataforma mãe. Sem sidebar.
      */}
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
            {solicitacao.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecione seu nome abaixo para preencher o formulário da sua
            solicitação de visto.
          </p>
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {solicitantes.map((s) => (
            <li key={s.id}>
              <Link
                href={`/${shortId}/${token}/s/${s.id}`}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  #{s.ordem}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{s.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.parentesco}
                  </span>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <StatusBadge tone={etapaTone(s.etapa)}>{s.etapa}</StatusBadge>
                  <StatusBadge tone={statusTone(s.status)}>{s.status}</StatusBadge>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Este link é pessoal e intransferível. Seus dados são usados apenas
            para sua solicitação junto à {organizacao.nome}.
          </p>
        </div>
      </section>

    </main>
  );
}
