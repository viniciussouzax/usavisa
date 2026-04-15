import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  contratarUrl: string;
};

/**
 * Nav da landing — só logo + âncoras da própria página + CTA de contratar.
 * Sem "Entrar" ou "Criar conta": login é via URL branded da assessoria
 * (/{shortId}/signin) ou master (/signin), e cadastro é feito pelo master.
 */
export function LandingNav({ contratarUrl }: Props) {
  return (
    <header className="bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo azul.png"
            alt="Sends160"
            width={120}
            height={28}
            priority
            className="h-auto w-[120px] dark:hidden"
          />
          <Image
            src="/logo branco.png"
            alt="Sends160"
            width={120}
            height={28}
            priority
            className="hidden h-auto w-[120px] dark:block"
          />
        </Link>

        <a
          href={contratarUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "sm" }), "uppercase")}
        >
          Contato
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
