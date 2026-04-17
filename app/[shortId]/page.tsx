import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, LifeBuoy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { ForceLightTheme } from "./[token]/components/force-light-theme";
import { OrgThemeInjector } from "./[token]/components/org-theme-injector";
import { listActivePublicLinksByOrg } from "@/shared/models/org-public-link";
import { buildWhatsAppUrl } from "@/app/data";

export default async function OrgLandingPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();
  if (!organizacao.ativa) notFound();

  const links = await listActivePublicLinksByOrg(organizacao.uid);
  const supportUrl = buildWhatsAppUrl(organizacao.whatsapp);

  return (
    <>
    <ForceLightTheme />
    {organizacao.color3 && <OrgThemeInjector color={organizacao.color3} />}
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-6 py-12">
      <section className="flex flex-col items-center gap-4 text-center">
        <OrganizacaoLogo organizacao={organizacao} size="lg" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {organizacao.nome}
          </h1>
          {organizacao.tagline && (
            <p className="text-sm text-muted-foreground">{organizacao.tagline}</p>
          )}
        </div>
        {organizacao.descricao && (
          <p className="max-w-md text-sm text-muted-foreground">
            {organizacao.descricao}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        {links.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            <p>Em breve.</p>
            <div className="flex gap-2">
              <Link href={`/${organizacao.shortId}/signin`}>
                <Button size="sm">
                  <LogIn className="mr-1 h-4 w-4" />
                  Entrar
                </Button>
              </Link>
              <a href={supportUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <LifeBuoy className="mr-1 h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <>
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
              >
                {link.icon && (
                  <span className="text-xl" aria-hidden>
                    {link.icon}
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {link.label}
                  </span>
                  {link.descricao && (
                    <span className="truncate text-xs text-muted-foreground">
                      {link.descricao}
                    </span>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}

            <Link
              href={`/${organizacao.shortId}/signin`}
              className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-sm font-medium">Acessar minha conta</span>
              <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>

            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
            >
              <LifeBuoy className="h-5 w-5" />
              <span className="text-sm font-medium">Falar no WhatsApp</span>
              <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          </>
        )}
      </section>

      <footer className="mt-auto text-center text-xs text-muted-foreground">
        {organizacao.footerText ?? `© ${new Date().getFullYear()} ${organizacao.nome}`}
      </footer>
    </main>
    </>
  );
}
