"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { titleFont } from "../fonts";

const faqs = [
  {
    q: "A Sends160 substitui meu assessor?",
    a: "Não. A esteira automatiza o trabalho repetitivo — preenchimento do DS-160, cadastro no CASV, emissão da taxa MRV, monitoramento de calendário e agendamento. O assessor continua fazendo triagem estratégica, análise do caso e orientação do solicitante, que é onde a decisão humana importa.",
  },
  {
    q: "Funciona com a marca da minha assessoria?",
    a: "Sim. Hotpage white-label com URL própria, logo, cores e tipografia personalizáveis. O solicitante acessa pela marca da assessoria e não vê a identidade Sends160 em nenhum ponto do fluxo.",
  },
  {
    q: "Quanto tempo leva para começar?",
    a: "Em 30 minutos de demonstração a esteira é montada usando um caso real da sua assessoria. O onboarding da equipe e a configuração da hotpage são concluídos em poucos dias.",
  },
  {
    q: "E se o fluxo da minha assessoria for diferente?",
    a: "As oito etapas são padrão do processo consular americano (DS-160, CASV, taxa MRV, agendamento, entrevista, acompanhamento de status). O que varia é a triagem inicial e a estratégia do caso — e isso continua com o assessor.",
  },
  {
    q: "Como é a cobrança?",
    a: "Mensalidade fixa de R$ 100, cobrada anualmente. Inclui 20 processos por mês, com custo por processo adicional acima disso. Assessores ilimitados e esteira completa sem feature-gating.",
  },
  {
    q: "Meus dados e dos clientes ficam seguros?",
    a: "Cada cliente tem seus dados isolados no sistema. Histórico de eventos auditável por caso. Acessos separados por papel (Owner, Admin, Assessor). Nenhum dado é compartilhado entre assessorias.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 space-y-8">
      <div className="text-left sm:text-center">
        <h2
          className={cn(
            titleFont.className,
            "text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl",
          )}
        >
          Perguntas frequentes
        </h2>
        <p className="mt-8 text-lg text-muted-foreground sm:mt-10 sm:text-xl">
          As dúvidas que todo dono de assessoria faz antes de começar.
        </p>
      </div>

      <Accordion className="mx-auto w-full max-w-3xl">
        {faqs.map((item, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border-b border-border"
          >
            <AccordionTrigger
              className={cn(
                titleFont.className,
                "py-5 text-left text-lg font-bold tracking-tight hover:no-underline",
              )}
            >
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
