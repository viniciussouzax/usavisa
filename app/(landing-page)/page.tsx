import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  LayoutDashboard,
  Link2,
  Palette,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import ComoFuncionaFeature from "@/components/shadcn-space/blocks/feature-02/como-funciona";
import { LandingNav } from "./components/landing-nav";
import { Contato } from "./components/contato";
import { titleFont } from "./fonts";

const SALES_WHATSAPP =
  process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "5511999999999";

function whatsappUrl(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${SALES_WHATSAPP}?text=${encoded}`;
}

export default function Home() {
  const diferenciais = [
    {
      icon: LayoutDashboard,
      title: "Painel único multi-caso",
      description:
        "Todas as solicitações consolidadas em uma interface, com filtros por status, responsável e etapa da esteira.",
    },
    {
      icon: Link2,
      title: "Link individual por solicitante",
      description:
        "Cada cliente recebe uma URL própria, responde no próprio ritmo e dispositivo. Auto-save a cada digitação.",
    },
    {
      icon: Palette,
      title: "White-label completo",
      description:
        "Hotpage com URL própria, logo, cores e tipografia da assessoria. O solicitante nunca vê a marca Sends160.",
    },
    {
      icon: ShieldCheck,
      title: "Permissões por papel",
      description:
        "Owner, Admin e Assessor com acessos separados. Equipe nova entra sem retrabalho de treinamento.",
    },
    {
      icon: Activity,
      title: "Histórico auditável",
      description:
        "Cada ação registrada no caso, com timeline completa. Dados isolados por cliente.",
    },
    {
      icon: CalendarClock,
      title: "Antecipação automática de agendamento",
      description:
        "O sistema monitora o calendário do consulado e reagenda automaticamente quando abre vaga melhor.",
    },
  ];

  const contratarPremiumUrl = whatsappUrl(
    "Olá, quero escalar minha assessoria com a Sends160.",
  );

  return (
    <div className="min-h-screen bg-background font-[Arial,sans-serif]">
      <LandingNav contratarUrl={contratarPremiumUrl} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl pt-8 sm:pt-12 lg:pt-20">
          {/* Hero original — inline, simples */}
          <section className="space-y-8 text-left sm:space-y-10 sm:text-center">
            <h1 className={cn(titleFont.className, "mx-auto max-w-5xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl")}>
              Escale sua assessoria de visto{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1235 650"
                role="img"
                aria-label="Estados Unidos"
                className="inline-block h-[0.56em] w-auto align-[-0.05em] rounded-[2px]"
              >
                <defs>
                  <polygon
                    id="us-pt"
                    points="-0.1624598481164531,0 0,-0.5 0.1624598481164531,0"
                    transform="scale(0.0616)"
                    fill="#FFF"
                  />
                  <g id="us-star">
                    <use href="#us-pt" transform="rotate(-144)" />
                    <use href="#us-pt" transform="rotate(-72)" />
                    <use href="#us-pt" />
                    <use href="#us-pt" transform="rotate(72)" />
                    <use href="#us-pt" transform="rotate(144)" />
                  </g>
                  <g id="us-s5">
                    <use href="#us-star" x="-0.252" />
                    <use href="#us-star" x="-0.126" />
                    <use href="#us-star" />
                    <use href="#us-star" x="0.126" />
                    <use href="#us-star" x="0.252" />
                  </g>
                  <g id="us-s6">
                    <use href="#us-s5" x="-0.063" />
                    <use href="#us-star" x="0.315" />
                  </g>
                  <g id="us-x4">
                    <use href="#us-s6" />
                    <use href="#us-s5" y="0.054" />
                    <use href="#us-s6" y="0.108" />
                    <use href="#us-s5" y="0.162" />
                  </g>
                  <g id="us-u">
                    <use href="#us-x4" y="-0.216" />
                    <use href="#us-x4" />
                    <use href="#us-s6" y="0.216" />
                  </g>
                  <rect
                    id="us-stripe"
                    width="1235"
                    height="50"
                    fill="#B22234"
                  />
                </defs>
                <rect width="1235" height="650" fill="#FFF" />
                <use href="#us-stripe" />
                <use href="#us-stripe" y="100" />
                <use href="#us-stripe" y="200" />
                <use href="#us-stripe" y="300" />
                <use href="#us-stripe" y="400" />
                <use href="#us-stripe" y="500" />
                <use href="#us-stripe" y="600" />
                <rect width="494" height="350" fill="#3C3B6E" />
                <use href="#us-u" transform="translate(247,175) scale(650)" />
              </svg>{" "}
              americano sem aumentar a operação
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Você cuida da análise e da estratégia. O resto roda no piloto
              automático, com etapas previsíveis e organizadas para liberar
              seu tempo.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center sm:gap-4 sm:pt-4">
              <a
                href={contratarPremiumUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "uppercase")}
              >
                Falar com especialista
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </section>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Como funciona — 9 etapas em checklist */}
        <div className="mx-auto mt-24 max-w-4xl">
          <ComoFuncionaFeature />
        </div>

        <div className="mx-auto mt-24 max-w-4xl space-y-24">
          {/* Diferenciais */}
          <section id="recursos" className="scroll-mt-20 space-y-8 sm:space-y-10">
            <div className="text-left sm:text-center">
              <h2 className={cn(titleFont.className, "text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl")}>
                Feito para escalar
              </h2>
              <p className="mt-8 text-lg text-muted-foreground sm:mt-10 sm:text-xl">
                Os recursos que sustentam a operação quando o volume de casos cresce.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {diferenciais.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="border-border">
                    <CardHeader>
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <CardTitle className={cn(titleFont.className, "text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl")}>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mx-auto mt-24 max-w-4xl">
          <Contato contratarUrl={contratarPremiumUrl} />
        </div>
      </main>

      <footer className="mt-24 bg-black text-white">
        <div className="container mx-auto px-4 py-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Sends160. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
