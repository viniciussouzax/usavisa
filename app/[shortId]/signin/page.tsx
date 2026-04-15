import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SignInForm from "@/app/signin/components/signin-form";
import { getUser } from "@/lib/auth";
import { buildWhatsAppUrl } from "@/app/data";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";
import { LifeBuoy } from "lucide-react";

export default async function OrgSignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ redirectTo?: string; redirectURL?: string }>;
}) {
  const { shortId } = await params;

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const { user } = await getUser();
  if (user) redirect(`/${shortId}/solicitacoes`);

  const sp = await searchParams;
  const redirectURL =
    sp.redirectURL || sp.redirectTo || `/${shortId}/solicitacoes`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header white-label — só a marca da org */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-4">
          <Link href={`/${organizacao.shortId}`} className="flex items-center gap-3">
            <OrganizacaoLogo organizacao={organizacao} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {organizacao.nome}
              </span>
              <span className="text-xs text-muted-foreground">
                Área do assessor
              </span>
            </div>
          </Link>

          <a
            href={buildWhatsAppUrl(
              organizacao.whatsapp,
              `Olá, preciso de ajuda para acessar a área do assessor.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
          >
            <LifeBuoy className="h-4 w-4" />
            <span className="hidden sm:inline">Suporte</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center w-full pt-16 pb-24">
          <div className="w-full max-w-md">
            <div className="border border-border rounded-lg bg-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Entrar</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Acesse sua conta em {organizacao.nome}
                </p>
              </div>
              <SignInForm
                redirectURL={redirectURL}
                recuperarHref={`/${shortId}/signin/recuperar`}
              />
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Não consegue acessar? Entre em contato pelo{" "}
              <a
                href={buildWhatsAppUrl(organizacao.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
