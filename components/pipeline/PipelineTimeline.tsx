"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Clock, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineLogEntry } from "@/shared/models/pipeline-log";

type Props = {
  logs: PipelineLogEntry[];
};

function eventIcon(evento: string, status?: string | null) {
  if (status === "Erro" || evento.includes("erro")) return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (status === "Falha") return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "Espera") return <Clock className="h-4 w-4 text-amber-500" />;
  if (status === "Executando") return <Loader2 className="h-4 w-4 text-sky-500" />;
  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
}

function eventLabel(log: PipelineLogEntry): string {
  const dados = log.dados as Record<string, unknown> | null;
  if (log.evento === "triagem.concluido") return "Triagem concluida — formulario finalizado";
  if (log.evento === "analise.aprovada") return "Analise aprovada — automacao autorizada";
  if (log.evento === "etapa.mudou") {
    const de = (dados as Record<string, string>)?.etapa ?? (dados as Record<string, string>)?.de ?? "?";
    const para = (dados as Record<string, string>)?.status ?? (dados as Record<string, string>)?.para ?? "?";
    return `Etapa/status atualizado (${de} → ${para})`;
  }
  if (log.evento === "automacao.iniciada") {
    return `Automacao DS-160 iniciada`;
  }
  if (log.evento === "automacao.concluida") {
    const appId = (dados as Record<string, string>)?.applicationId;
    return `DS-160 concluido${appId ? ` — ${appId}` : ""}`;
  }
  if (log.evento === "automacao.erro") {
    const msg = (dados as Record<string, string>)?.mensagem ?? "erro desconhecido";
    return `DS-160 erro: ${msg}`;
  }
  if (log.evento === "pagina.concluida") {
    const ff = (dados as Record<string, number>)?.fieldsFilled ?? 0;
    const ft = (dados as Record<string, number>)?.fieldsTotal ?? 0;
    const dur = log.duracaoMs ? `${(log.duracaoMs / 1000).toFixed(1)}s` : "";
    return `${log.tarefa} — ${ff}/${ft} campos${dur ? `, ${dur}` : ""}`;
  }
  if (log.evento === "pagina.erro") {
    const msg = (dados as Record<string, string>)?.mensagem ?? "";
    return `${log.tarefa} — erro: ${msg}`;
  }
  if (log.evento === "input.erro") {
    const campo = (dados as Record<string, string>)?.campo ?? "?";
    const msg = (dados as Record<string, string>)?.mensagem ?? "";
    return `Campo ${campo}: ${msg}`;
  }
  return log.evento;
}

function relativeTime(date: Date | null): string {
  if (!date) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min atras`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atras`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function TimelineEntry({ log }: { log: PipelineLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const dados = log.dados as Record<string, unknown> | null;
  const hasDetails = dados && Object.keys(dados).length > 0;

  return (
    <li className="flex gap-3 py-2">
      <div className="mt-0.5 shrink-0">{eventIcon(log.evento, log.status)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", log.evento.includes("erro") ? "text-red-600" : "text-foreground")}>
            {eventLabel(log)}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(log.createdAt)}</span>
        </div>
        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
            {expanded ? "Ocultar" : "Detalhes"}
          </button>
        )}
        {expanded && dados && (
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
            {JSON.stringify(dados, null, 2)}
          </pre>
        )}
      </div>
    </li>
  );
}

export function PipelineTimeline({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum evento registrado ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {logs.map((log) => (
        <TimelineEntry key={log.id} log={log} />
      ))}
    </ul>
  );
}
