import { ArrowUpDown, Plus } from "lucide-react";
import { StatusBadge } from "@/components/layout/status-badge";
import { etapaTone, statusTone, type Etapa, type Status } from "@/app/data";

type MockRow = {
  id: string;
  nome: string;
  nota: string;
  etapa: Etapa;
  status: Status;
};

const mockRows: MockRow[] = [
  {
    id: "2050",
    nome: "Família Silva",
    nota: "Turismo EUA — 4 solicitantes",
    etapa: "Triagem",
    status: "Doing",
  },
  {
    id: "2049",
    nome: "Carlos Mendes",
    nota: "Renovação B1/B2",
    etapa: "Formulário DS-160",
    status: "Done",
  },
  {
    id: "2048",
    nome: "Ana Souza",
    nota: "Primeira solicitação F1",
    etapa: "Agendamento CASV",
    status: "Todo",
  },
  {
    id: "2047",
    nome: "Pedro Lima",
    nota: "Negado anterior, 221(g)",
    etapa: "Entrevista",
    status: "Done",
  },
  {
    id: "2046",
    nome: "Família Rocha",
    nota: "Turismo — 3 titulares",
    etapa: "Aprovado",
    status: "Done",
  },
];

const statusPills: Status[] = ["Todo", "Doing", "Done", "Retry"];

/**
 * Preview visual da tela de Solicitações — mockup estático no hero.
 * Em mobile, as linhas viram cards empilhados. Em md+, layout de tabela.
 */
export function SolicitacoesPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-gradient-to-r from-sky-200/60 via-white/0 to-amber-200/60 blur-3xl dark:from-sky-500/15 dark:via-black/0 dark:to-amber-500/15"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-3 sm:px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="ml-2 flex-1 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground sm:ml-4">
            app.sends160.com/solicitacoes
          </div>
        </div>

        {/* Header da página */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">
              Solicitações
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              Sua assessoria
            </p>
          </div>
          <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" />
            Criar Novo
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs text-foreground">
              Todas as etapas
            </div>
            <div className="flex items-center gap-1">
              {statusPills.map((s, i) => (
                <div
                  key={s}
                  className={
                    i === 1
                      ? "flex h-7 items-center rounded-md bg-primary px-2.5 text-xs text-primary-foreground"
                      : "flex h-7 items-center rounded-md px-2.5 text-xs text-muted-foreground"
                  }
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Mobile: lista de cards. md+: grid de tabela. */}
        <div className="md:hidden divide-y divide-border">
          {mockRows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-xs text-muted-foreground">
                    #{row.id}
                  </div>
                  <div className="truncate text-sm font-semibold text-foreground">
                    {row.nome}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">
                    {row.nota}
                  </div>
                </div>
                <div className="h-3.5 w-3.5 shrink-0 rounded border border-border" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={etapaTone(row.etapa)}>
                  {row.etapa}
                </StatusBadge>
                <StatusBadge tone={statusTone(row.status)}>
                  {row.status}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block divide-y divide-border">
          <div className="grid grid-cols-[auto_60px_1fr_140px_120px] items-center gap-3 bg-muted/30 px-6 py-2.5 text-xs font-medium text-muted-foreground">
            <div className="h-3.5 w-3.5 rounded border border-border" />
            <div>ID</div>
            <div>Nome</div>
            <div>Etapa</div>
            <div>Status</div>
          </div>
          {mockRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[auto_60px_1fr_140px_120px] items-center gap-3 px-6 py-3 text-sm"
            >
              <div className="h-3.5 w-3.5 rounded border border-border" />
              <div className="text-muted-foreground">#{row.id}</div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{row.nome}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {row.nota}
                </span>
              </div>
              <div>
                <StatusBadge tone={etapaTone(row.etapa)}>
                  {row.etapa}
                </StatusBadge>
              </div>
              <div>
                <StatusBadge tone={statusTone(row.status)}>
                  {row.status}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
