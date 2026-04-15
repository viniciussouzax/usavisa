import Link from "next/link";
import { LifeBuoy, LinkIcon } from "lucide-react";
import { buildWhatsAppUrl, type Organizacao } from "@/app/data";
import { Button } from "@/components/ui/button";
import { OrganizacaoLogo } from "@/components/layout/organizacao-logo";

type Props = {
  organizacao: Organizacao;
  reason: "revoked" | "expired";
};

export function ShareLinkEnded({ organizacao, reason }: Props) {
  const title =
    reason === "expired" ? "Este link expirou" : "Este link foi encerrado";
  const supportUrl = organizacao.whatsapp
    ? buildWhatsAppUrl(
        organizacao.whatsapp,
        "Olá, recebi um link que não está mais ativo. Pode me ajudar?",
      )
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link
          href={`/${organizacao.shortId}`}
          className="flex items-center gap-2"
        >
          <OrganizacaoLogo organizacao={organizacao} size="sm" />
          <span className="text-sm font-medium">{organizacao.nome}</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <LinkIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            O acesso a esta solicitação foi encerrado pela assessoria.
            {supportUrl
              ? " Entre em contato para solicitar um novo link."
              : " Entre em contato com a assessoria para solicitar um novo link."}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {supportUrl && (
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <a href={supportUrl} target="_blank" rel="noreferrer" />
                }
              >
                <LifeBuoy className="mr-1 h-4 w-4" />
                Falar com a assessoria
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/${organizacao.shortId}`} />}
            >
              Ir para a página inicial
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
