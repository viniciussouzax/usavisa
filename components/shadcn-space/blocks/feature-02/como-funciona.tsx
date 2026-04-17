"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  ArrowDown,
  CheckCircle2,
  Circle,
  Loader2,
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
import { SUB_ETAPAS, type Tarefa } from "@/shared/pipeline/stages";

// ---------------------------------------------------------------------------
// Status visual do scroll (landing-only — nao e o status real do solicitante)
// ---------------------------------------------------------------------------

type ScrollStatus = "Todo" | "Doing" | "Done";

type TaskStatusCtx = {
  register: (id: string, el: HTMLLIElement | null) => void;
  getStatus: (id: string) => ScrollStatus;
};

const TaskStatusContext = createContext<TaskStatusCtx | null>(null);

function TaskStatusProvider({ children }: { children: React.ReactNode }) {
  const refsMap = useRef<Map<string, HTMLLIElement>>(new Map());
  const [statuses, setStatuses] = useState<Record<string, ScrollStatus>>({});
  const statusesRef = useRef<Record<string, ScrollStatus>>({});

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
      const visible = rect.bottom > 0 && rect.top < vh;
      if (!visible) return;
      const distance = Math.abs(c - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = id;
      }
    });

    const next: Record<string, ScrollStatus> = {};
    refsMap.current.forEach((_, id) => {
      if (id === bestId) {
        next[id] = "Doing";
      } else {
        const c = centers.get(id) ?? Infinity;
        next[id] = c < center ? "Done" : "Todo";
      }
    });

    const prev = statusesRef.current;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    let changed = prevKeys.length !== nextKeys.length;
    if (!changed) {
      for (const k of nextKeys) {
        if (prev[k] !== next[k]) { changed = true; break; }
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
      recompute();
    },
    [recompute],
  );

  const getStatus = useCallback(
    (id: string): ScrollStatus => statuses[id] ?? "Todo",
    [statuses],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId: number | null = null;
    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => { rafId = null; recompute(); });
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

function useTaskStatus(id: string) {
  const ctx = useContext(TaskStatusContext);
  if (!ctx) throw new Error("useTaskStatus needs TaskStatusProvider");
  const { register, getStatus } = ctx;
  const ref = useCallback(
    (el: HTMLLIElement | null) => register(id, el),
    [id, register],
  );
  return { status: getStatus(id), ref };
}

// ---------------------------------------------------------------------------
// Icones e row de tarefa
// ---------------------------------------------------------------------------

function TaskStatusIcon({ status }: { status: ScrollStatus }) {
  if (status === "Done") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "Doing") return <Loader2 className="h-4 w-4 animate-spin text-sky-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

function TaskRow({
  id,
  tarefa,
  onStatusChange,
}: {
  id: string;
  tarefa: Tarefa;
  onStatusChange?: (status: ScrollStatus) => void;
}) {
  const { status, ref } = useTaskStatus(id);

  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

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
            status === "Doing" && "text-[1.14rem] leading-snug text-foreground font-medium",
            status === "Todo" && "text-sm text-muted-foreground",
          )}
        >
          {tarefa.titulo}
        </span>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Card de sub-etapa (automacao)
// ---------------------------------------------------------------------------

function SubEtapaCard({
  subEtapa,
  etapaIdx,
}: {
  subEtapa: (typeof SUB_ETAPAS)[number];
  etapaIdx: number;
}) {
  const [taskStatuses, setTaskStatuses] = useState<ScrollStatus[]>(() =>
    subEtapa.tarefas.map(() => "Todo"),
  );

  const handleTaskStatusChange = useCallback(
    (idx: number) => (status: ScrollStatus) => {
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
  const isDoing = !allDone && !allTodo;

  return (
    <li className="py-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-500",
            allDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
            isDoing && "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
            !allDone && !isDoing && "bg-muted text-muted-foreground",
          )}
        >
          {allDone ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <span className={cn(titleFont.className, "font-bold")}>{subEtapa.letra}</span>
          )}
        </span>
        <h3 className="min-w-0 flex-1 text-lg font-semibold text-foreground">
          {subEtapa.titulo}
        </h3>
        {allDone ? (
          <StatusBadge tone="success">Concluido</StatusBadge>
        ) : isDoing ? (
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

      <ul className="mt-4 flex flex-col gap-2.5">
        {subEtapa.tarefas.map((tarefa, idx) => (
          <TaskRow
            key={tarefa.id}
            id={`${etapaIdx}-${idx}`}
            tarefa={tarefa}
            onStatusChange={handleTaskStatusChange(idx)}
          />
        ))}
      </ul>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const humanSteps = [
  {
    numero: "1",
    icon: Send,
    titulo: "Envie o link",
    etapa: "Triagem",
    descricao:
      "Envie o link do caso e concentre toda a coleta em um único lugar. A plataforma reúne dados, aplica validações automáticas, padroniza respostas e organiza tudo no formato esperado para o processo consular.",
  },
  {
    numero: "2",
    icon: Search,
    titulo: "Analise o caso",
    etapa: "Análise",
    descricao:
      "Com os dados limpos e organizados, foque na análise técnica. Revise o perfil, identifique riscos, ajuste informações e defina a melhor estratégia para conduzir a solicitação.",
  },
  {
    numero: "3",
    icon: Zap,
    titulo: "Autorize",
    etapa: "Automação",
    descricao:
      "Basta aprovar o caso para a plataforma assumir as próximas etapas. O que antes exigia tempo manual passa a ser executado com rapidez, consistência e escala.",
  },
];

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
            {humanSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.numero}>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle className={cn(titleFont.className, "text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl")}>
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

        {/* BLOCO 2 — Transicao */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-left sm:text-center">
            <h2 className={cn(titleFont.className, "text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl")}>
              Ative o piloto automatico
            </h2>
            <p className="mt-8 text-lg text-muted-foreground sm:mt-10 sm:text-xl">
              Automatize a execução e foque no crescimento.
            </p>
          </div>
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* BLOCO 3 — Automacao: lista animada de sub-etapas e tarefas */}
        <TaskStatusProvider>
          <motion.ul
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border"
          >
            {SUB_ETAPAS.map((subEtapa, idx) => (
              <SubEtapaCard key={subEtapa.slug} subEtapa={subEtapa} etapaIdx={idx} />
            ))}
          </motion.ul>
        </TaskStatusProvider>

      </div>
    </section>
  );
}
