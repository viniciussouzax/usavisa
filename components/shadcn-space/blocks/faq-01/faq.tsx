import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_DATA = [
  {
    question: "A Sends160 substitui meu assessor?",
    answer:
      "Não. A esteira automatiza o trabalho repetitivo — preenchimento do DS-160, cadastro no CASV, geração do boleto MRV, monitoramento do calendário e agendamento. O assessor continua fazendo o que exige julgamento: triagem estratégica, análise do caso e revisão antes do envio.",
  },
  {
    question: "Quais etapas do processo são automatizadas?",
    answer:
      "Oito etapas: triagem do solicitante, pré-análise, DS-160 no CEAC, cadastro no CASV, geração do boleto MRV, monitoramento de data, agendamento (com adiantamento automático quando abre vaga melhor) e check de status final. A assessoria entra nas duas primeiras; a esteira resolve as seis seguintes.",
  },
  {
    question: "Consigo usar minha própria marca?",
    answer:
      "Sim. Hotpage com URL própria, logo, cores e tipografia da assessoria. O solicitante acessa pela marca da assessoria e não vê a identidade Sends160 em nenhum ponto do fluxo.",
  },
  {
    question: "Como funciona a cobrança?",
    answer:
      "O plano Free tem mensalidade zero e tarifa por processo, com limite de 20 processos por mês e 1 assessor. O Premium é uma mensalidade fixa com tarifa por processo reduzida, processos ilimitados e assessores ilimitados. A esteira completa das oito etapas roda igual nos dois planos — a escolha é pelo volume.",
  },
  {
    question: "Quanto tempo leva para começar?",
    answer:
      "Na demonstração de 30 minutos a esteira é montada usando um caso real da assessoria. A partir dali, o onboarding da equipe e a configuração da hotpage white-label são concluídos em poucos dias.",
  },
];

export default function Faq() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:py-24 py-8 flex flex-col gap-16">
        <div className="flex flex-col gap-4 items-center animate-in fade-in slide-in-from-top-10 duration-1000 delay-100 ease-in-out fill-mode-both">
          <Badge
            variant="outline"
            className="text-sm h-auto py-1 px-3 border-0 outline outline-border"
          >
            FAQ
          </Badge>
          <h2 className="text-5xl font-medium text-center max-w-xl">
            Perguntas que todo dono de assessoria faz
          </h2>
        </div>
        <div>
          <Accordion className="w-full flex flex-col gap-6">
            {FAQ_DATA.map((faq, index) => (
              <AccordionItem
                key={`item-${index}`}
                value={`item-${index}`}
                className={cn(
                  "p-6 border border-border rounded-2xl flex flex-col gap-3 group/item data-[open]:bg-accent transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both",
                  index === 0 && "delay-100",
                  index === 1 && "delay-200",
                  index === 2 && "delay-300",
                  index === 3 && "delay-400",
                  index === 4 && "delay-500",
                )}
              >
                <AccordionTrigger className="p-0 text-xl font-medium hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden cursor-pointer">
                  {faq.question}
                  <PlusIcon className="w-6 h-6 shrink-0 transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45" />
                </AccordionTrigger>
                <AccordionContent className="p-0 text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
