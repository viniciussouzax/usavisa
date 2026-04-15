import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { titleFont } from "../fonts";

const hoje = [
  "Cinco ferramentas abertas pra acompanhar um caso",
  "Áudio de WhatsApp pra explicar o formulário pela quinta vez",
  "Madrugada corrigindo resposta que o cliente preencheu errado",
  "Planilha paralela pra não perder de vista onde cada caso parou",
  "Cliente ligando no sábado porque esqueceu a documentação",
  "Ninguém da equipe sabe em que etapa o processo está",
];

const comSends = [
  "Todos os casos em um painel único, do link ao status final",
  "Formulário guiado em português, preenchido no próprio ritmo",
  "Validação automática antes de o caso chegar pra sua revisão",
  "Histórico registrado a cada etapa, sem planilha paralela",
  "Solicitante recebe as atualizações sem você precisar mexer",
  "Equipe sabe exatamente em que ponto cada processo está",
];

export function AntesDepois() {
  return (
    <section className="space-y-10">
      <div className="text-center">
        <h2
          className={cn(
            titleFont.className,
            "text-3xl font-bold tracking-tight text-foreground",
          )}
        >
          Sua rotina hoje. Sua rotina com Sends160.
        </h2>
        <p className="mt-2 text-muted-foreground">
          O mesmo dia a dia reorganizado em uma esteira que sustenta o volume.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-6">
          <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Hoje
          </div>
          <ul className="flex flex-col gap-3">
            {hoje.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="h-3 w-3" />
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border-2 border-primary bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">
            Com Sends160
          </div>
          <ul className="flex flex-col gap-3">
            {comSends.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
