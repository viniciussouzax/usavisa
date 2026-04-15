import {
  Building2,
  CalendarCheck2,
  CalendarSearch,
  CheckCircle2,
  ClipboardEdit,
  FileCheck,
  Receipt,
  Sparkles,
} from "lucide-react";

type Step = {
  numero: string;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  emBreve?: boolean;
};

/**
 * "Como funciona" = as 8 etapas da esteira no ciclo de vida de uma
 * solicitação. Assessoria entra na triagem e na análise; a esteira
 * resolve as seis etapas seguintes.
 */
export function ComoFunciona() {
  const steps: Step[] = [
    {
      numero: "1",
      titulo: "Triagem",
      descricao:
        "Coleta de dados do solicitante via formulário guiado em português, com respostas adaptativas por tipo de visto, consultas automáticas (CPF, CEP, DDI) e validação em tempo real.",
      icon: ClipboardEdit,
    },
    {
      numero: "2",
      titulo: "Pré-análise com IA",
      descricao:
        "Cruzamento automático do perfil do solicitante com padrões históricos de aprovação e negação, identificando pontos fracos antes da revisão humana e sugerindo ajustes na estratégia do caso.",
      icon: Sparkles,
      emBreve: true,
    },
    {
      numero: "3",
      titulo: "DS-160",
      descricao:
        "Preenchimento automático do DS-160 no CEAC usando os dados já validados. Sem redigitar, sem retrabalho.",
      icon: FileCheck,
    },
    {
      numero: "4",
      titulo: "Cadastro CASV",
      descricao:
        "Registro automático do solicitante no CASV, com os dados do caso sincronizados da triagem.",
      icon: Building2,
    },
    {
      numero: "5",
      titulo: "Boleto MRV",
      descricao:
        "Geração automática do boleto da taxa consular (MRV) para pagamento do solicitante.",
      icon: Receipt,
    },
    {
      numero: "6",
      titulo: "Monitoramento de data",
      descricao:
        "Varredura contínua do calendário do consulado selecionado, identificando vagas conforme as preferências do caso.",
      icon: CalendarSearch,
    },
    {
      numero: "7",
      titulo: "Agendamento",
      descricao:
        "Marca a entrevista na data confirmada e adianta automaticamente quando abre vaga melhor no calendário.",
      icon: CalendarCheck2,
    },
    {
      numero: "8",
      titulo: "Check de status",
      descricao:
        "Acompanha o resultado final — aprovado, negado, administrativo — e registra no histórico do caso.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-20 space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Como funciona
        </h2>
        <p className="mt-2 text-muted-foreground">
          Uma solicitação, oito etapas automáticas. A assessoria entra na
          triagem e na análise. A esteira resolve as seis etapas seguintes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.numero}
              className="relative flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-background">
                <Icon className="h-6 w-6 text-foreground" />
              </div>
              <div className="absolute -top-3 right-6 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-foreground px-2 text-xs font-bold text-background">
                {step.numero}
              </div>
              {step.emBreve && (
                <div className="absolute -top-3 left-6 flex h-7 items-center justify-center rounded-full border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground">
                  em breve
                </div>
              )}
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">{step.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
