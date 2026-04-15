import { ArrowUpRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { titleFont } from "../fonts";

export function Pricing({
  contratarPremiumUrl,
}: {
  contratarPremiumUrl: string;
}) {
  const features = [
    "Inclui 20 processos/mês",
    "Custo por processo adicional",
    "Assessores ilimitados",
    "Esteira completa",
    "Hotpage white-label",
    "Formulário DS-160 completo",
    "Consultas automáticas (CPF, CNPJ, CEP, DDI)",
    "Suporte prioritário",
  ];

  return (
    <section id="precos" className="scroll-mt-20 space-y-8">
      <div className="text-center">
        <h2 className={cn(titleFont.className, "text-3xl font-bold tracking-tight text-foreground")}>
          Cresça sem travar sua operação
        </h2>
        <p className="mt-2 text-muted-foreground">
          Você paga conforme utiliza. Sem depender de planos rígidos ou
          estrutura complexa.
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <div className="relative flex flex-col gap-5 rounded-xl border-2 border-primary bg-card p-6 shadow-sm">
          <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
            Recomendado
          </span>

          <div>
            <h3 className="text-xl font-semibold">Premium</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Assessoria em operação. Esteira completa com tarifa por processo
              reduzida e assessores ilimitados.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">R$ 100</span>
              <span className="text-sm text-muted-foreground">/ mês</span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              Cobrado anualmente
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-sm">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <a
            href={contratarPremiumUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "mt-auto")}
          >
            Contratar agora
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
