import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { titleFont } from "../fonts";

type Props = {
  contratarUrl: string;
};

export function Contato({ contratarUrl }: Props) {
  return (
    <section
      id="contato"
      className="scroll-mt-20 rounded-xl border border-border bg-card p-8 text-center"
    >
      <h2 className={cn(titleFont.className, "text-4xl font-bold tracking-tight text-card-foreground sm:text-6xl lg:text-7xl")}>
        Pronto para sair do operacional?
      </h2>
      <p className="mt-8 text-lg text-card-foreground/70 sm:mt-10 sm:text-xl">
        Deixe a execução com o sistema e foque no que realmente gera resultado.
      </p>
      <div className="mt-8 flex justify-center sm:mt-10">
        <a
          href={contratarUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "uppercase")}
        >
          Falar com especialista
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
