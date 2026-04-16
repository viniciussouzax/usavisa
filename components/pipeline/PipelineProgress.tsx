"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/layout/status-badge";
import { SUB_ETAPAS } from "@/shared/pipeline/stages";
import { statusTone, type Status } from "@/app/data";

type Props = {
  etapa: string;
  subEtapa: string | null;
  tarefaAtual: string | null;
  status: string;
};

function taskIcon(taskStatus: string) {
  if (taskStatus === "Concluido") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (taskStatus === "Executando") return <Loader2 className="h-4 w-4 animate-spin text-sky-500" />;
  if (taskStatus === "Erro") return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (taskStatus === "Falha") return <XCircle className="h-4 w-4 text-red-500" />;
  if (taskStatus === "Espera") return <Clock className="h-4 w-4 text-amber-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

function deriveSubEtapaStatus(
  slug: string,
  activeSubEtapa: string | null,
  activeStatus: string,
): string {
  if (!activeSubEtapa) return "Pendente";
  const activeIdx = SUB_ETAPAS.findIndex((s) => s.slug === activeSubEtapa);
  const thisIdx = SUB_ETAPAS.findIndex((s) => s.slug === slug);
  if (thisIdx < activeIdx) return "Concluido";
  if (thisIdx > activeIdx) return "Pendente";
  return activeStatus;
}

function deriveTaskStatus(
  taskId: string,
  subEtapaSlug: string,
  activeSubEtapa: string | null,
  activeTarefa: string | null,
  activeStatus: string,
): string {
  const subStatus = deriveSubEtapaStatus(subEtapaSlug, activeSubEtapa, activeStatus);
  if (subStatus === "Concluido") return "Concluido";
  if (subStatus === "Pendente") return "Pendente";
  if (!activeTarefa) return "Pendente";

  const sub = SUB_ETAPAS.find((s) => s.slug === subEtapaSlug);
  if (!sub) return "Pendente";
  const activeTaskIdx = sub.tarefas.findIndex((t) => t.id === activeTarefa);
  const thisTaskIdx = sub.tarefas.findIndex((t) => t.id === taskId);
  if (thisTaskIdx < activeTaskIdx) return "Concluido";
  if (thisTaskIdx > activeTaskIdx) return "Pendente";
  return activeStatus;
}

export function PipelineProgress({ etapa, subEtapa, tarefaAtual, status }: Props) {
  if (etapa !== "Automacao") {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          {taskIcon(status)}
        </div>
        <div>
          <p className="text-sm font-medium">{etapa}</p>
          <StatusBadge tone={statusTone(status as Status)}>{status}</StatusBadge>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {SUB_ETAPAS.filter((s) => !["entrevista", "resultado"].includes(s.slug)).map((sub) => {
        const subStatus = deriveSubEtapaStatus(sub.slug, subEtapa, status);
        return (
          <div key={sub.slug} className="py-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  subStatus === "Concluido" && "bg-emerald-100 text-emerald-700",
                  subStatus === "Executando" && "bg-sky-100 text-sky-700",
                  subStatus !== "Concluido" && subStatus !== "Executando" && "bg-muted text-muted-foreground",
                )}
              >
                {subStatus === "Concluido" ? <CheckCircle2 className="h-4 w-4" /> : sub.letra}
              </span>
              <h4 className="flex-1 text-sm font-semibold">{sub.titulo}</h4>
              <StatusBadge tone={statusTone(subStatus as Status)}>
                {subStatus === "Executando" && (
                  <span className="relative mr-1.5 inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                  </span>
                )}
                {subStatus}
              </StatusBadge>
            </div>

            {sub.slug === subEtapa && (
              <ul className="mt-3 flex flex-col gap-1.5 pl-10">
                {sub.tarefas.map((tarefa) => {
                  const tStatus = deriveTaskStatus(tarefa.id, sub.slug, subEtapa, tarefaAtual, status);
                  return (
                    <li key={tarefa.id} className="flex items-center gap-2">
                      {taskIcon(tStatus)}
                      <span
                        className={cn(
                          "text-sm",
                          tStatus === "Concluido" && "text-muted-foreground",
                          tStatus === "Executando" && "font-medium text-foreground",
                          tStatus === "Pendente" && "text-muted-foreground/60",
                          (tStatus === "Erro" || tStatus === "Falha") && "text-red-600 font-medium",
                        )}
                      >
                        {tarefa.titulo}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
