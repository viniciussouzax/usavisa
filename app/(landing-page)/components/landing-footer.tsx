import Image from "next/image";
import Link from "next/link";

type Props = {
  demoUrl: string;
};

export function LandingFooter({ demoUrl }: Props) {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo azul.png"
                alt="Sends160"
                width={120}
                height={28}
                className="h-auto w-[120px] dark:hidden"
              />
              <Image
                src="/logo branco.png"
                alt="Sends160"
                width={120}
                height={28}
                className="hidden h-auto w-[120px] dark:block"
              />
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              A esteira operacional do visto americano — da triagem ao
              agendamento, em uma plataforma só.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Navegação</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#como-funciona"
                  className="hover:text-foreground"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#recursos" className="hover:text-foreground">
                  Diferenciais
                </a>
              </li>
              <li>
                <a href="#precos" className="hover:text-foreground">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-foreground">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Contato</p>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:contato@sends160.com"
                  className="hover:text-foreground"
                >
                  contato@sends160.com
                </a>
              </li>
              <li>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  Falar no WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Sends160. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              Termos de uso
            </a>
            <a href="#" className="hover:text-foreground">
              Política de privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
