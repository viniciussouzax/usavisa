import { Badge } from "@/components/ui/badge";
import ReminderAnimation from "@/components/shadcn-space/blocks/bento-grid-01/ReminderAnimation";
import AnimatedUiBlock from "@/components/shadcn-space/blocks/bento-grid-01/AnimatedUiBlock";

const Bentogrid = () => {
  return (
    <section>
      <div className="py-11 md:py-20">
        <div className="max-w-7xl xl:px-16 lg:px-8 px-4 mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4 items-center justify-center max-w-3xl mx-auto">
            <Badge variant={"outline"} className="px-3 py-1 h-auto text-sm font-normal">
              Recursos em destaque
            </Badge>
            <h2 className="text-center md:text-5xl text-3xl mx-auto font-medium">
              A plataforma que sustenta a esteira
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-5">
            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border">
                <div className="bg-muted rounded-t-xl py-8 px-9 relative">
                  <ReminderAnimation />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Painel único multi-caso
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Todas as solicitações da assessoria consolidadas em uma interface, com filtros por status, responsável e etapa da esteira.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border">
                <div className="bg-muted rounded-t-xl py-7 lg:px-30 px-6 relative">
                  <AnimatedUiBlock />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Esteira de 8 etapas rodando em tempo real
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Triagem, DS-160 no CEAC, cadastro no CASV, boleto MRV, monitoramento de calendário, agendamento e check de status — cada etapa executada sem intervenção manual.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-1.png"
                    alt="layout options"
                    className="dark:hidden"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-darkimg-1.png"
                    alt="layout options"
                    className="hidden dark:block"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    White-label completo
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Logo, cores, tipografia e hotpage com URL própria da assessoria.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-2.png"
                    alt="documentation"
                    className="dark:hidden"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-darkimg-2.png"
                    alt="documentation"
                    className="hidden dark:block"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Consultas automáticas
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    CEP, ZIP code, CPF, CNPJ e DDI preenchidos sem redigitar.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 col-span-12 overflow-hidden">
              <div className="rounded-xl border border-border h-full flex flex-col">
                <div className="p-8 bg-muted rounded-t-xl flex-1 flex items-center justify-center relative">
                  <img
                    src="https://images.shadcnspace.com/assets/bento-grid/bento-grid-img-3.png"
                    alt="color options"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-8 border-t border-border">
                  <h3 className="text-xl font-medium text-foreground">
                    Permissões por papel
                  </h3>
                  <p className="text-base font-normal text-muted-foreground">
                    Owner, Admin e Assessor com acessos separados. A equipe cresce sem virar gargalo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bentogrid;
