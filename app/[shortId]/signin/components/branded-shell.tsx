import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { buildWhatsAppUrl, type Organizacao } from "@/app/data";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";

type Props = {
  organizacao: Organizacao;
  subtitle: string;
  children: React.ReactNode;
  footerMessage?: string;
};

/**
 * Shell visual branded por organização — usado nas páginas de signin, recuperar
 * e redefinir senha do assessor.
 */
export function BrandedSigninShell({
  organizacao,
  subtitle,
  children,
  footerMessage,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-4">
          <Link
            href={`/${organizacao.shortId}`}
            className="flex items-center gap-3"
          >
            <OrganizacaoLogo organizacao={organizacao} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {organizacao.nome}
              </span>
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </Link>

          <a
            href={buildWhatsAppUrl(
              organizacao.whatsapp,
              "Olá, preciso de ajuda para acessar a área do assessor.",
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
        <div className="flex w-full flex-col items-center justify-center pb-24 pt-16">
          <div className="w-full max-w-md">
            <div className="rounded-lg border border-border bg-card p-8 md:p-10">
              {children}
            </div>

            {footerMessage && (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {footerMessage}{" "}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
