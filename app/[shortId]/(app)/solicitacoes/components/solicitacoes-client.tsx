"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  ALL_ETAPAS,
  ETAPAS,
  STATUSES,
  etapaTone,
  statusTone,
  type Etapa,
  type Solicitacao,
  type Status,
} from "@/app/data";
import { createSolicitacaoAction } from "@/shared/behaviors/solicitacao/actions/create-solicitacao.action";

type Props = {
  shortId: string;
  organizacaoUid: string;
  solicitacoes: Solicitacao[];
};

export function SolicitacoesClient({
  shortId,
  organizacaoUid,
  solicitacoes,
}: Props) {
  const router = useRouter();
  const [etapaFilter, setEtapaFilter] = useState<Etapa | typeof ALL_ETAPAS>(
    ALL_ETAPAS,
  );
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return solicitacoes.filter((row) => {
      if (etapaFilter !== ALL_ETAPAS && row.etapa !== etapaFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      return true;
    });
  }, [solicitacoes, etapaFilter, statusFilter]);

  return (
    <>
      <PageHeader
        title="Solicitações"
        description={shortId}
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" />}>
              <Plus className="mr-1 h-4 w-4" />
              Criar Novo
            </SheetTrigger>
            <NewSolicitacaoDrawer
              organizacaoUid={organizacaoUid}
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </Sheet>
        }
      />

      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={etapaFilter}
              onValueChange={(v) =>
                setEtapaFilter(v as Etapa | typeof ALL_ETAPAS)
              }
            >
              <SelectTrigger className="h-9 w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ETAPAS}>{ALL_ETAPAS}</SelectItem>
                {ETAPAS.map((etapa) => (
                  <SelectItem key={etapa} value={etapa}>
                    {etapa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              value={statusFilter ? [statusFilter] : []}
              onValueChange={(v) =>
                setStatusFilter(((v[0] as Status) ?? null) as Status | null)
              }
              size="sm"
              spacing={2}
            >
              {STATUSES.map((s) => (
                <ToggleGroupItem
                  key={s}
                  value={s}
                  className="border-0 text-muted-foreground hover:bg-accent hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"
                >
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <Button variant="ghost" size="sm">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Selecionar todos" />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="w-16">—</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-40 text-center text-sm text-muted-foreground"
                  >
                    {solicitacoes.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <p>Nenhuma solicitação cadastrada ainda.</p>
                        <Button size="sm" onClick={() => setOpen(true)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Criar a primeira
                        </Button>
                      </div>
                    ) : (
                      "Nenhuma solicitação encontrada com os filtros atuais."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/${shortId}/solicitacoes/${row.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`Selecionar ${row.id}`} />
                    </TableCell>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{row.nota}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <StatusBadge tone={etapaTone(row.etapa)}>{row.etapa}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.url || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function NewSolicitacaoDrawer({
  organizacaoUid,
  onSuccess,
}: {
  organizacaoUid: string;
  onSuccess: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SheetContent side="right" className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Nova solicitação</SheetTitle>
        <SheetDescription>
          Preencha os campos abaixo para criar uma nova solicitação.
        </SheetDescription>
      </SheetHeader>

      <form
        className="grid gap-4 px-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          const res = await createSolicitacaoAction({
            organizacaoUid,
            nome: String(fd.get("nome") ?? "").trim(),
            nota: String(fd.get("nota") ?? "").trim(),
            url: String(fd.get("url") ?? "").trim(),
          });
          setPending(false);
          if (res.error) {
            setError(res.error);
            return;
          }
          onSuccess();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" placeholder="Família Silva" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nota">Nota</Label>
          <Textarea id="nota" name="nota" placeholder="Descrição curta" rows={4} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">URL</Label>
          <Input id="url" name="url" type="url" placeholder="https://..." />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <SheetFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
