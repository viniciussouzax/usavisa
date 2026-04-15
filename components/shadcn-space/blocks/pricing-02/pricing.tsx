"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Flame } from "lucide-react";
import { motion, type Variants } from "motion/react";

type PricingPlan = {
  plan_name: string;
  plan_descp: string;
  plan_price: string;
  plan_price_note: string;
  plan_price_extra: string;
  plan_feature: string[];
  plan_cta_label: string;
  plan_cta_href: string;
  plan_recommended: boolean;
};

const SALES_WHATSAPP =
  process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "5511999999999";

const whatsappUrl = (message: string) =>
  `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;

const pricingData: PricingPlan[] = [
  {
    plan_name: "Premium",
    plan_descp:
      "Assessoria em operação. Esteira completa com tarifa por processo reduzida e assessores ilimitados.",
    plan_price: "R$ 100",
    plan_price_note: "/ mês",
    plan_price_extra: "Cobrado anualmente",
    plan_feature: [
      "Inclui 20 processos/mês",
      "Custo por processo adicional",
      "Assessores ilimitados",
      "Esteira completa das 8 etapas",
      "Hotpage white-label",
      "Formulário DS-160 completo",
      "Consultas automáticas (CPF, CNPJ, CEP, DDI)",
      "Suporte prioritário",
    ],
    plan_cta_label: "Contratar",
    plan_cta_href: whatsappUrl(
      "Olá, quero contratar o plano Premium da Sends160.",
    ),
    plan_recommended: true,
  },
];

const Pricing = () => {
  const pricingCardVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.25,
        duration: 0.6,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <section className="bg-background py-10 lg:py-0">
      <div className="max-w-7xl mx-auto px-4 xl:px-16 lg:py-20 sm:py-16 py-8">
        <div className="flex flex-col gap-8 md:gap-12 items-center justify-center w-full">
          <div className="flex flex-col gap-4 justify-center items-center">
            <Badge
              variant={"outline"}
              className="py-1 px-3 text-sm font-normal leading-5 w-fit h-7"
            >
              Preços
            </Badge>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-foreground text-3xl sm:text-5xl font-medium">
                Cresça sem travar sua operação
              </h2>
              <p className="mt-3 text-muted-foreground">
                Você paga conforme utiliza. Sem depender de planos rígidos ou
                estrutura complexa.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 items-stretch h-full w-full max-w-md">
            {pricingData.map((plan: PricingPlan, index: number) => {
              const isFeatured = plan.plan_recommended;

              return (
                <motion.div
                  key={index}
                  variants={pricingCardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index}
                  className={cn(
                    "relative flex-1 flex flex-col w-full",
                    isFeatured && "z-10 scale-102"
                  )}
                >
                  {isFeatured && (
                    <div className="absolute -inset-0.5 rounded-2xl overflow-hidden">
                      <div className="absolute -inset-full blur-xs animate-spin [animation-duration:2s] bg-conic from-blue-500 via-red-500 to-teal-400" />
                      <div className="absolute inset-0.5 rounded-2xl bg-card" />
                    </div>
                  )}

                  <Card
                    className={cn(
                      "relative flex-1 flex flex-col rounded-2xl p-8 gap-8",
                      isFeatured ? "border-0 ring-0" : "border border-border"
                    )}
                  >
                    <CardHeader className="p-0">
                      <div className="flex flex-col gap-3 self-stretch">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-medium text-primary">
                            {plan.plan_name}
                          </CardTitle>
                          {isFeatured && (
                            <Badge className="py-1 px-3 text-sm font-medium leading-5 w-fit h-7 flex items-center gap-1.5 [&>svg]:size-4!">
                              <Flame size={16} /> Recomendado
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base font-normal">
                          {plan.plan_descp}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 gap-8 p-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-foreground text-4xl sm:text-5xl font-medium">
                            {plan.plan_price}
                          </span>
                          <span className="text-muted-foreground text-base font-normal">
                            {plan.plan_price_note}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {plan.plan_price_extra}
                        </span>
                      </div>

                      <Separator orientation="horizontal" />

                      <ul className="flex flex-col gap-4 flex-1">
                        {plan.plan_feature.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-3 text-base font-normal text-muted-foreground"
                          >
                            <Check className="size-4 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <a
                        href={plan.plan_cta_href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          className="w-full h-12 cursor-pointer"
                          variant={isFeatured ? "default" : "outline"}
                        >
                          {plan.plan_cta_label}
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
