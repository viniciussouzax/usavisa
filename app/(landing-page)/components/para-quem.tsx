import { cn } from "@/lib/utils";
import { titleFont } from "../fonts";

export function ParaQuem() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 text-center">
      <h2
        className={cn(
          titleFont.className,
          "text-3xl font-bold tracking-tight text-foreground",
        )}
      >
        Feito para assessorias de visto americano que querem crescer sem virar
        noite
      </h2>
      <p className="text-muted-foreground">
        Seja na primeira dezena de clientes ou nos primeiros 200 casos do mês,
        a esteira escala sem exigir mais equipe.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          Assessorias independentes
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          Equipes pequenas escalando
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          Operações de alto volume
        </span>
      </div>
    </section>
  );
}
