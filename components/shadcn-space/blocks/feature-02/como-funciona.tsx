"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Status } from "@/app/data";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  ArrowDown,
  CheckCircle2,
  Circle,
  Loader2,
  RotateCcw,
  Search,
  Send,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { titleFont } from "@/app/(landing-page)/fonts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tarefa = {
  titulo: string;
  descricao?: string;
};

type EtapaLista = {
  numero: string;
  titulo: string;
  descricao: string;
  tarefas: Tarefa[];
};

const triagemSteps = [
  {
    numero: "1",
    icon: Send,
    titulo: "Envie o link",
    descricao:
      "Envie o link do caso e concentre toda a coleta de informações em um único lugar. A plataforma reúne dados de um ou mais solicitantes, aplica validações automáticas, padroniza respostas e organiza tudo no formato esperado para o processo consular. Sua única ação aqui é enviar o link.",
  },
  {
    numero: "2",
    icon: Search,
    titulo: "Análise caso",
    descricao:
      "Com os dados já limpos, organizados e padronizados, você foca no que realmente importa: análise técnica. Revise o perfil, identifique riscos, ajuste informações necessárias e defina a melhor estratégia para conduzir a solicitação. Toda a inteligência e decisão da assessoria acontece nesta etapa.",
  },
  {
    numero: "3",
    icon: Zap,
    titulo: "Autorize",
    descricao:
      "Depois de tudo validado e definido, basta aprovar o caso para a plataforma assumir as próximas etapas operacionais. O que antes exigia tempo manual passa a ser executado com rapidez, consistência e escala. Você mantém o controle da decisão e delega a execução.",
  },
];

const etapas: EtapaLista[] = [
  {
    numero: "A",
    titulo: "DS-160 (CEAC)",
    descricao:
      "Preenchimento completo do formulário oficial e geração das confirmações.",
    tarefas: [
      {
        titulo: "Acessa o sistema oficial CEAC",
        descricao: "Abre uma sessão autenticada no portal oficial do visto.",
      },
      {
        titulo: "Resolve etapas de validação e captcha",
        descricao:
          "Desbloqueia as confirmações e captchas exigidos durante o preenchimento.",
      },
      {
        titulo: "Inicia a solicitação e cria o Application ID",
        descricao:
          "Abre um novo processo no CEAC e gera o identificador oficial.",
      },
      {
        titulo: "Salva o número do processo para continuidade",
        descricao:
          "Registra o Application ID no caso para retomada em qualquer momento.",
      },
      {
        titulo: "Preenche todas as páginas do formulário DS-160",
        descricao:
          "Transcreve as respostas validadas em cada seção do formulário oficial.",
      },
      {
        titulo: "Valida a foto contra critérios consulares e faz upload",
        descricao:
          "Checa dimensões, fundo e enquadramento antes de enviar a foto pelo sistema oficial.",
      },
      {
        titulo: "Revisa os dados preenchidos",
        descricao:
          "Verifica coerência de todos os campos antes da confirmação final.",
      },
      {
        titulo: "Confirma a finalização do formulário",
        descricao:
          "Submete o DS-160 no sistema oficial e encerra a solicitação.",
      },
      {
        titulo: "Gera a página de confirmação (Confirmation Page)",
        descricao:
          "Captura a Confirmation Page com barcode exigida na entrevista consular.",
      },
      {
        titulo: "Baixa o PDF da confirmação",
        descricao: "Salva o PDF da Confirmation Page no histórico do caso.",
      },
      {
        titulo: "Baixa o PDF completo do DS-160",
        descricao:
          "Guarda a cópia integral das respostas para auditoria futura.",
      },
      {
        titulo: "Envia os documentos por e-mail ao solicitante",
        descricao:
          "Dispara o e-mail com os documentos e instruções para o solicitante.",
      },
    ],
  },
  {
    numero: "B",
    titulo: "Cadastro e taxa (AIS)",
    descricao: "Cadastro do solicitante no AIS e emissão da taxa consular.",
    tarefas: [
      {
        titulo: "Acessa o sistema oficial AIS",
        descricao:
          "Abre sessão autenticada no Applicant Information System.",
      },
      {
        titulo: "Cria o perfil do solicitante",
        descricao:
          "Cadastra o solicitante no AIS usando os dados já validados do caso.",
      },
      {
        titulo: "Realiza a confirmação do cadastro por e-mail",
        descricao:
          "Ativa a conta clicando no link de confirmação enviado pelo AIS.",
      },
      {
        titulo: "Adiciona solicitantes vinculados ao mesmo perfil",
        descricao:
          "Agrupa familiares ou dependentes no mesmo processo quando aplicável.",
      },
      {
        titulo: "Emite o boleto da taxa MRV",
        descricao:
          "Gera o documento de cobrança da taxa consular no valor oficial.",
      },
      {
        titulo: "Envia o boleto por e-mail ao solicitante",
        descricao:
          "Encaminha o boleto com instruções claras de pagamento e prazo.",
      },
    ],
  },
  {
    numero: "C",
    titulo: "Monitoramento",
    descricao: "Acompanha pagamento e disponibilidade de vagas no consulado.",
    tarefas: [
      {
        titulo: "Aguarda a confirmação do pagamento",
        descricao:
          "Consulta periodicamente o status do boleto até ser compensado.",
      },
      {
        titulo: "Monitora o calendário para agendamento",
        descricao:
          "Verifica continuamente vagas liberadas no consulado selecionado.",
      },
    ],
  },
  {
    numero: "D",
    titulo: "Agendamento",
    descricao:
      "Marca o CASV, a entrevista e organiza retirada/entrega do passaporte.",
    tarefas: [
      {
        titulo: "Agenda o CASV",
        descricao:
          "Marca a coleta biométrica no centro de atendimento mais próximo.",
      },
      {
        titulo: "Agenda a entrevista consular",
        descricao:
          "Marca a entrevista consular na data disponível escolhida.",
      },
      {
        titulo: "Baixa o comprovante de pagamento",
        descricao: "Salva o comprovante oficial do pagamento da taxa MRV.",
      },
      {
        titulo: "Baixa o guia/comprovante de agendamento",
        descricao:
          "Guarda os documentos necessários para levar no CASV e na entrevista.",
      },
      {
        titulo: "Define local de retirada ou entrega do passaporte",
        descricao:
          "Configura o ponto de retirada ou o endereço de entrega do passaporte.",
      },
      {
        titulo: "Seleciona o método de entrega disponível",
        descricao:
          "Escolhe a forma de entrega conforme as opções do consulado.",
      },
    ],
  },
  {
    numero: "E",
    titulo: "Status do visto (CEAC)",
    descricao:
      "Consulta e atualização contínua do status oficial após a entrevista.",
    tarefas: [
      {
        titulo: "Acessa o sistema oficial de consulta CEAC",
        descricao:
          "Abre sessão autenticada no portal oficial de consulta do visto.",
      },
      {
        titulo: "Consulta automaticamente o andamento do processo",
        descricao:
          "Verifica o status em intervalos regulares até o desfecho final.",
      },
      {
        titulo: "Identifica e atualiza os status oficiais",
        descricao:
          "Application Received · Ready · Administrative Processing · Issued · Refused",
      },
    ],
  },
];

/**
 * Coordenador global: mantém a posição Y de cada tarefa registrada e
 * escolhe UMA como Doing — aquela cujo centro está mais próximo do
 * centro da viewport, entre as que visualmente se sobrepõem à viewport.
 * As demais viram Done (se acima) ou Todo (se abaixo). Garante 1 Doing
 * por vez, mesmo em scrolls rápidos.
 */
type TaskStatusCtx = {
  register: (id: string, el: HTMLLIElement | null) => void;
  getStatus: (id: string) => Status;
};

const TaskStatusContext = createContext<TaskStatusCtx | null>(null);

function TaskStatusProvider({ children }: { children: React.ReactNode }) {
  const refsMap = useRef<Map<string, HTMLLIElement>>(new Map());
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const statusesRef = useRef<Record<string, Status>>({});

  const recompute = useCallback(() => {
    if (typeof window === "undefined") return;
    const vh = window.innerHeight;
    const center = vh * 0.5;

    const centers = new Map<string, number>();
    let bestId: string | null = null;
    let bestDistance = Infinity;

    refsMap.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      const c = (rect.top + rect.bottom) / 2;
      centers.set(id, c);
      // Só considera Doing se o elemento realmente toca a viewport.
      const visible = rect.bottom > 0 && rect.top < vh;
      if (!visible) return;
      const distance = Math.abs(c - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = id;
      }
    });

    const next: Record<string, Status> = {};
    refsMap.current.forEach((_, id) => {
      if (id === bestId) {
        next[id] = "Doing";
      } else {
        const c = centers.get(id) ?? Infinity;
        next[id] = c < center ? "Done" : "Todo";
      }
    });

    // Só atualiza se houve mudança real.
    const prev = statusesRef.current;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    let changed = prevKeys.length !== nextKeys.length;
    if (!changed) {
      for (const k of nextKeys) {
        if (prev[k] !== next[k]) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      statusesRef.current = next;
      setStatuses(next);
    }
  }, []);

  const register = useCallback(
    (id: string, el: HTMLLIElement | null) => {
      if (el) refsMap.current.set(id, el);
      else refsMap.current.delete(id);
      // Recalcula sempre que um ref é registrado/removido.
      recompute();
    },
    [recompute],
  );

  const getStatus = useCallback(
    (id: string) => statuses[id] ?? "Todo",
    [statuses],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId: number | null = null;
    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        recompute();
      });
    };
    recompute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [recompute]);

  return (
    <TaskStatusContext.Provider value={{ register, getStatus }}>
      {children}
    </TaskStatusContext.Provider>
  );
}

function useTaskStatus(id: string): {
  status: Status;
  ref: (el: HTMLLIElement | null) => void;
} {
  const ctx = useContext(TaskStatusContext);
  if (!ctx) throw new Error("useTaskStatus needs TaskStatusProvider");
  const { register, getStatus } = ctx;
  const ref = useCallback(
    (el: HTMLLIElement | null) => register(id, el),
    [id, register],
  );
  return { status: getStatus(id), ref };
}

function TaskStatusIcon({ status }: { status: Status }) {
  if (status === "Done") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status === "Doing") {
    return <Loader2 className="h-4 w-4 animate-spin text-sky-500" />;
  }
  if (status === "Retry") {
    return <RotateCcw className="h-4 w-4 text-red-500" />;
  }
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

function TaskRow({
  id,
  tarefa,
  onStatusChange,
}: {
  id: string;
  tarefa: Tarefa;
  onStatusChange?: (status: Status) => void;
}) {
  const { status, ref } = useTaskStatus(id);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-start gap-3 transition-all duration-300",
        status === "Doing" && "py-6",
      )}
    >
      <span className="mt-0.5 shrink-0">
        <TaskStatusIcon status={status} />
      </span>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block transition-colors duration-300",
            status === "Done" && "text-sm text-muted-foreground",
            status === "Doing" &&
              "text-[1.14rem] leading-snug text-foreground font-medium",
            (status === "Todo" || status === "Retry") &&
              "text-sm text-muted-foreground",
          )}
        >
          {tarefa.titulo}
        </span>
        {/* Descrição das tarefas desativada — dados preservados em `etapas` para reativação futura.
        {tarefa.descricao && (
          <p
            className={cn(
              "mt-1 transition-colors duration-300",
              status === "Doing"
                ? "text-sm leading-snug text-muted-foreground"
                : "text-xs",
              status === "Done" && "text-muted-foreground/60",
              (status === "Todo" || status === "Retry") &&
                "text-muted-foreground",
            )}
          >
            {tarefa.descricao}
          </p>
        )}
        */}
      </div>
    </li>
  );
}

function EtapaCard({
  etapa,
  etapaIdx,
}: {
  etapa: EtapaLista;
  etapaIdx: number;
}) {
  const [taskStatuses, setTaskStatuses] = useState<Status[]>(() =>
    etapa.tarefas.map(() => "Todo"),
  );

  const handleTaskStatusChange = useCallback(
    (idx: number) => (status: Status) => {
      setTaskStatuses((prev) => {
        if (prev[idx] === status) return prev;
        const next = [...prev];
        next[idx] = status;
        return next;
      });
    },
    [],
  );

  const allDone = taskStatuses.every((s) => s === "Done");
  const allTodo = taskStatuses.every((s) => s === "Todo");
  const etapaDone = allDone;
  const etapaDoing = !allDone && !allTodo;

  return (
    <li className="py-6">
      <div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-500",
              etapaDone &&
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
              etapaDoing &&
                "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
              !etapaDone && !etapaDoing && "bg-muted text-muted-foreground",
            )}
          >
            {etapaDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span className={cn(titleFont.className, "font-bold")}>
                {etapa.numero}
              </span>
            )}
          </span>
          <h3 className="min-w-0 flex-1 text-lg font-semibold text-foreground">
            {etapa.titulo}
          </h3>
          {etapaDone ? (
            <StatusBadge tone="success">Concluído</StatusBadge>
          ) : etapaDoing ? (
            <StatusBadge tone="info">
              <span className="relative mr-1.5 inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
              </span>
              Executando
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Pendente</StatusBadge>
          )}
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {etapa.tarefas.map((tarefa, idx) => (
          <TaskRow
            key={idx}
            id={`${etapaIdx}-${idx}`}
            tarefa={tarefa}
            onStatusChange={handleTaskStatusChange(idx)}
          />
        ))}
      </ul>
    </li>
  );
}

export default function ComoFuncionaFeature() {
  return (
    <section id="como-funciona" className="scroll-mt-20">
      <div className="flex flex-col gap-10 md:gap-14">
            {/* BLOCO 1 — Humano: Você faz só 3 coisas */}
            <div className="flex flex-col gap-8 sm:gap-10">
              <div className="text-left sm:text-center">
                <h2 className={cn(titleFont.className, "text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl")}>
                  Você faz só 3 coisas
                </h2>
                <p className="mt-8 text-lg text-muted-foreground sm:mt-10 sm:text-xl">
                  As únicas etapas que exigem julgamento humano. Todo o resto é automação.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {triagemSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <Card key={step.numero}>
                      <CardHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-6 w-6 text-foreground" />
                        </div>
                        <CardTitle
                          className={cn(titleFont.className, "text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl")}
                        >
                          {step.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-muted-foreground">
                          {step.descricao}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* BLOCO 2 — Transição */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-left sm:text-center">
                <h2 className={cn(titleFont.className, "text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl")}>
                  Piloto automático
                </h2>
                <p className="mt-8 text-lg text-muted-foreground sm:mt-10 sm:text-xl">
                  Automatize a execução e foque no crescimento.
                </p>
              </div>
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* BLOCO 3 — Sistema: lista animada */}
            <TaskStatusProvider>
              <motion.ul
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border"
              >
                {etapas.map((etapa, idx) => (
                  <EtapaCard
                    key={etapa.numero}
                    etapa={etapa}
                    etapaIdx={idx}
                  />
                ))}
              </motion.ul>
            </TaskStatusProvider>

          </div>
    </section>
  );
}
