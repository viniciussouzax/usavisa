"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Archive,
  Check,
  Copy,
  Link2,
  Link2Off,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  ALL_ETAPAS,
  ETAPAS,
  STATUSES,
  etapaTone,
  statusTone,
  statusesForEtapa,
  type Etapa,
  type Solicitacao,
  type Solicitante,
  type Status,
} from "@/app/data";
import type { LatestShareLink } from "@/shared/models/share-link";
import type { LatestSolicitanteShareLink } from "@/shared/models/solicitante-share-link";
import type { FormDataSnapshot } from "@/shared/models/form-data";
import { EngineHost } from "@/shared/form-engine/renderer/EngineHost";
import { revokeShareLinkAction } from "@/shared/behaviors/share-link/actions/revoke-share-link.action";
import { reactivateShareLinkAction } from "@/shared/behaviors/share-link/actions/reactivate-share-link.action";
import { regenerateShareLinkAction } from "@/shared/behaviors/share-link/actions/regenerate-share-link.action";
import { ensureSolicitanteShareLinkAction } from "@/shared/behaviors/solicitante-share-link/actions/ensure-solicitante-share-link.action";
import { revokeSolicitanteShareLinkAction } from "@/shared/behaviors/solicitante-share-link/actions/revoke-solicitante-share-link.action";
import { reactivateSolicitanteShareLinkAction } from "@/shared/behaviors/solicitante-share-link/actions/reactivate-solicitante-share-link.action";
import { regenerateSolicitanteShareLinkAction } from "@/shared/behaviors/solicitante-share-link/actions/regenerate-solicitante-share-link.action";
import { createSolicitanteAction } from "@/shared/behaviors/solicitante/actions/create-solicitante.action";
import { updateSolicitanteAction } from "@/shared/behaviors/solicitante/actions/update-solicitante.action";
import { deleteSolicitanteAction } from "@/shared/behaviors/solicitante/actions/delete-solicitante.action";
import { dispatchDs160RunAction } from "@/shared/behaviors/solicitante/actions/dispatch-ds160-run.action";
import { abortRunAction } from "@/shared/behaviors/solicitante/actions/abort-run.action";
import { continueAfterFixAction } from "@/shared/behaviors/solicitante/actions/continue-after-fix.action";
import type { PipelineLogEntry } from "@/shared/models/pipeline-log";
import { PipelineProgress } from "@/components/pipeline/PipelineProgress";
import { PipelineTimeline } from "@/components/pipeline/PipelineTimeline";
import { updateSolicitacaoAction } from "@/shared/behaviors/solicitacao/actions/update-solicitacao.action";
import { archiveSolicitacaoAction } from "@/shared/behaviors/solicitacao/actions/archive-solicitacao.action";
import { useRouter } from "next/navigation";

type ApplicantLinkMap = Record<string, LatestSolicitanteShareLink | null>;
type FormDataMap = Record<string, FormDataSnapshot>;
type PipelineLogsMap = Record<string, PipelineLogEntry[]>;

type Props = {
  solicitacao: Solicitacao;
  solicitantes: Solicitante[];
  shortId: string;
  initialShareLink: LatestShareLink | null;
  initialApplicantLinks: ApplicantLinkMap;
  initialFormData: FormDataMap;
  initialPipelineLogs: PipelineLogsMap;
};

export function SolicitanteListClient({
  solicitacao,
  solicitantes,
  shortId,
  initialShareLink,
  initialApplicantLinks,
  initialFormData,
  initialPipelineLogs,
}: Props) {
  const router = useRouter();
  const [etapaFilter, setEtapaFilter] = useState<Etapa | typeof ALL_ETAPAS>(
    ALL_ETAPAS,
  );
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Solicitante | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState<LatestShareLink | null>(
    initialShareLink,
  );
  const [applicantLinks, setApplicantLinks] =
    useState<ApplicantLinkMap>(initialApplicantLinks);
  const [pending, startTransition] = useTransition();
  const [copyingApplicantId, setCopyingApplicantId] = useState<string | null>(
    null,
  );

  async function copyApplicantLink(solicitanteId: string) {
    setCopyingApplicantId(solicitanteId);
    try {
      const res = await ensureSolicitanteShareLinkAction({
        solicitanteUid: solicitanteId,
      });
      if (res.error || !res.token) {
        toast.error(res.error ?? "Erro ao gerar link");
        return;
      }
      const url = `${window.location.origin}/${shortId}/${res.token}`;
      await navigator.clipboard.writeText(url);
      setApplicantLinks((m) => ({
        ...m,
        [solicitanteId]: {
          token: res.token!,
          revoked: false,
          expiresAt: null,
          accessCount: m[solicitanteId]?.accessCount ?? 0,
        },
      }));
      toast.success("Link individual copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    } finally {
      setCopyingApplicantId(null);
    }
  }

  const shareUrl =
    shareLink && typeof window !== "undefined"
      ? `${window.location.origin}/${shortId}/${shareLink.token}`
      : shareLink
        ? `/${shortId}/${shareLink.token}`
        : null;

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar — tente manualmente.");
    }
  }

  function handleToggleRevoked() {
    if (!shareLink) return;
    const token = shareLink.token;
    const wasRevoked = shareLink.revoked;
    startTransition(async () => {
      const result = wasRevoked
        ? await reactivateShareLinkAction({ token })
        : await revokeShareLinkAction({ token });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setShareLink({ ...shareLink, revoked: !wasRevoked });
      toast.success(wasRevoked ? "Link reativado" : "Link revogado");
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateShareLinkAction({
        solicitacaoUid: solicitacao.uid,
        previousToken: shareLink?.token,
      });
      if (result.error || !result.token) {
        toast.error(result.error ?? "Erro ao gerar link");
        return;
      }
      setShareLink({
        token: result.token,
        revoked: false,
        expiresAt: null,
        accessCount: 0,
      });
      toast.success("Novo link gerado");
    });
  }

  const filtered = useMemo(() => {
    return solicitantes.filter((row) => {
      if (etapaFilter !== ALL_ETAPAS && row.etapa !== etapaFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      return true;
    });
  }, [solicitantes, etapaFilter, statusFilter]);

  return (
    <>
      <PageHeader
        title={solicitacao.nome}
        description={`#${solicitacao.id}`}
        backHref={`/${shortId}/solicitacoes`}
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" />}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Solicitante
            </SheetTrigger>
            <NewSolicitanteDrawer
              solicitacaoUid={solicitacao.uid}
              onSuccess={() => setOpen(false)}
            />
          </Sheet>
        }
      />

      <div className="px-6 pt-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">Link de acesso público</h2>
                {shareLink && (
                  <span
                    className={
                      shareLink.revoked
                        ? "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        : "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {shareLink.revoked ? "Revogado" : "Ativo"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {shareLink
                  ? `${shareLink.accessCount} acesso${shareLink.accessCount === 1 ? "" : "s"} registrado${shareLink.accessCount === 1 ? "" : "s"}`
                  : "Nenhum link gerado ainda"}
              </p>
              {shareUrl && (
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="h-9 font-mono text-xs"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                    disabled={shareLink?.revoked}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {shareLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleRevoked}
                  disabled={pending}
                >
                  {shareLink.revoked ? (
                    <>
                      <Link2 className="mr-1 h-4 w-4" />
                      Reativar
                    </>
                  ) : (
                    <>
                      <Link2Off className="mr-1 h-4 w-4" />
                      Revogar
                    </>
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={pending}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {shareLink ? "Gerar novo" : "Gerar link"}
              </Button>
            </div>
          </div>
        </div>
      </div>

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

          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Configurações da solicitação"
                />
              }
            >
              <Settings2 className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Configurações</SheetTitle>
                <SheetDescription>
                  {solicitacao.nome} · #{solicitacao.id}
                </SheetDescription>
              </SheetHeader>
              <SettingsContent
                solicitacao={solicitacao}
                shortId={shortId}
                onClose={() => setSettingsOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        <Sheet
          open={selected !== null}
          onOpenChange={(v) => !v && setSelected(null)}
        >
          {selected && (
            <SolicitanteDetailDrawer
              solicitante={selected}
              shortId={shortId}
              link={applicantLinks[selected.id] ?? null}
              initialFormSnapshot={
                initialFormData[selected.id] ?? {
                  data: {},
                  arrayData: {},
                  visitedSections: [],
                  naFields: [],
                  unknownFields: [],
                  updatedAt: null,
                }
              }
              pipelineLogs={initialPipelineLogs[selected.id] ?? []}
              onLinkChange={(next) =>
                setApplicantLinks((m) => ({ ...m, [selected.id]: next }))
              }
              onClose={() => setSelected(null)}
            />
          )}
        </Sheet>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Selecionar todos" />
                </TableHead>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" aria-label="Ações" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-40 text-center text-sm text-muted-foreground"
                  >
                    {solicitantes.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <p>Nenhum solicitante adicionado ainda.</p>
                        <Button size="sm" onClick={() => setOpen(true)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Adicionar primeiro
                        </Button>
                      </div>
                    ) : (
                      "Nenhum solicitante encontrado com os filtros atuais."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => {
                  const link = applicantLinks[row.id];
                  const isCopying = copyingApplicantId === row.id;
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(row)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox aria-label={`Selecionar ${row.nome}`} />
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">#{row.ordem}</TableCell>
                      <TableCell>{row.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{row.parentesco}</TableCell>
                      <TableCell className="text-muted-foreground">{row.cpf}</TableCell>
                      <TableCell>
                        <StatusBadge tone={etapaTone(row.etapa)}>{row.etapa}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={
                            link && !link.revoked
                              ? "Copiar link individual"
                              : "Gerar e copiar link individual"
                          }
                          title={
                            link && !link.revoked
                              ? "Copiar link individual"
                              : "Gerar link individual"
                          }
                          onClick={() => copyApplicantLink(row.id)}
                          disabled={isCopying}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function SettingsContent({
  solicitacao,
  shortId,
  onClose,
}: {
  solicitacao: Solicitacao;
  shortId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(solicitacao.nome);
  const [nota, setNota] = useState(solicitacao.nota);
  const [url, setUrl] = useState(solicitacao.url);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateSolicitacaoAction({
        uid: solicitacao.uid,
        nome,
        nota,
        url,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Alterações salvas");
      router.refresh();
    });
  }

  function archive() {
    if (!confirm("Arquivar esta solicitação? Ela some das listas mas pode ser restaurada.")) return;
    startTransition(async () => {
      const res = await archiveSolicitacaoAction({
        uid: solicitacao.uid,
        mode: "archive",
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Solicitação arquivada");
      onClose();
      router.push(`/${shortId}/solicitacoes`);
    });
  }

  function hardDelete() {
    if (!confirm("Excluir permanentemente? Todos os solicitantes e dados do formulário serão perdidos.")) return;
    if (!confirm("Essa ação não pode ser desfeita. Tem certeza?")) return;
    startTransition(async () => {
      const res = await archiveSolicitacaoAction({
        uid: solicitacao.uid,
        mode: "delete",
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Solicitação excluída");
      onClose();
      router.push(`/${shortId}/solicitacoes`);
    });
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <section className="grid gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Informações
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="settings-nome">Nome</Label>
          <Input
            id="settings-nome"
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="settings-nota">Nota</Label>
          <Input
            id="settings-nota"
            value={nota}
            onChange={(e) => setNota(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="settings-url">URL</Label>
          <Input
            id="settings-url"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
            placeholder="https://..."
          />
        </div>
        <Button size="sm" className="mt-1 w-fit" onClick={save} disabled={pending}>
          Salvar alterações
        </Button>
      </section>

      <div className="h-px bg-border" />

      <section className="grid gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Zona de perigo
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={archive}
          disabled={pending}
        >
          <Archive className="mr-2 h-4 w-4" />
          Arquivar solicitação
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={hardDelete}
          disabled={pending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir solicitação
        </Button>
      </section>
    </div>
  );
}

function SolicitanteDetailDrawer({
  solicitante,
  shortId,
  link,
  initialFormSnapshot,
  pipelineLogs,
  onLinkChange,
  onClose,
}: {
  solicitante: Solicitante;
  shortId: string;
  link: LatestSolicitanteShareLink | null;
  initialFormSnapshot: FormDataSnapshot;
  pipelineLogs: PipelineLogEntry[];
  onLinkChange: (next: LatestSolicitanteShareLink | null) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>(solicitante.etapa);
  const [status, setStatus] = useState<Status>(solicitante.status);
  const [pending, startTransition] = useTransition();

  function saveInfo() {
    startTransition(async () => {
      const res = await updateSolicitanteAction({
        uid: solicitante.id,
        etapa,
        status,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Alterações salvas");
      router.refresh();
    });
  }

  function removeSolicitante() {
    if (!confirm(`Remover ${solicitante.nome}? Todos os dados do formulário serão perdidos.`)) return;
    startTransition(async () => {
      const res = await deleteSolicitanteAction({ uid: solicitante.id });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Solicitante removido");
      onClose();
      router.refresh();
    });
  }

  function dispatchAutomation() {
    if (!confirm(`Disparar automação DS-160 para ${solicitante.nome}?`)) return;
    startTransition(async () => {
      const res = await dispatchDs160RunAction({ solicitanteUid: solicitante.id, mode: "real" });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Automação iniciada: ${res.runId}`, {
        action: {
          label: "Abrir Apify",
          onClick: () => window.open(res.consoleUrl, "_blank"),
        },
      });
    });
  }

  return (
    <SheetContent side="right" className="w-full sm:max-w-2xl">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {solicitante.nome.charAt(0)}
          </div>
          <div>
            <SheetTitle>{solicitante.nome}</SheetTitle>
            <SheetDescription>
              #{solicitante.ordem} · {solicitante.parentesco}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="info" className="flex flex-1 flex-col overflow-hidden px-4">
        <TabsList className="w-fit">
          <TabsTrigger value="info">Informacoes</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="form">Formulario</TabsTrigger>
          <TabsTrigger value="link">Link</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4">
            <div className="grid gap-1">
              <span className="text-xs text-muted-foreground">CPF</span>
              <span className="text-sm">{solicitante.cpf || "—"}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detail-etapa">Etapa</Label>
              <Select
                value={etapa}
                onValueChange={(v) => setEtapa((v ?? etapa) as Etapa)}
              >
                <SelectTrigger id="detail-etapa" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ETAPAS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {(statusesForEtapa(etapa) as readonly string[]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStatus(s as Status)}
                    className="cursor-pointer"
                  >
                    <StatusBadge
                      tone={s === status ? statusTone(s as Status) : "neutral"}
                      className={
                        s === status ? "ring-1 ring-ring" : "opacity-50"
                      }
                    >
                      {s}
                    </StatusBadge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={saveInfo} disabled={pending}>
                Salvar alterações
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={removeSolicitante}
                disabled={pending}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Remover
              </Button>
            </div>

            <div className="grid gap-2 pt-4 border-t">
              <Label>Automação DS-160</Label>
              <p className="text-xs text-muted-foreground">
                Dispara o preenchimento automático no site do CEAC. O solicitante precisa ter finalizado o formulário.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={dispatchAutomation}
                disabled={pending}
                className="w-fit"
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Disparar automação
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-6">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Progresso</h4>
              <PipelineProgress
                etapa={solicitante.etapa}
                subEtapa={solicitante.subEtapa}
                tarefaAtual={solicitante.tarefaAtual}
                status={solicitante.status}
              />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Timeline</h4>
              <PipelineTimeline logs={pipelineLogs} />
            </div>

            {solicitante.status === "Executando" && (
              <div className="pt-4 border-t">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Abortar a execucao em andamento?")) return;
                    startTransition(async () => {
                      const res = await abortRunAction({ solicitanteUid: solicitante.id });
                      if (!res.ok) { toast.error(res.error); return; }
                      toast.success("Execucao abortada");
                      router.refresh();
                    });
                  }}
                >
                  Abortar execucao
                </Button>
              </div>
            )}

            {solicitante.status === "Erro" && (
              <div className="pt-4 border-t">
                <p className="mb-2 text-sm text-muted-foreground">
                  Corrija os dados no formulario e clique para retomar.
                </p>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Continuar automacao com dados corrigidos?")) return;
                    startTransition(async () => {
                      const res = await continueAfterFixAction({ solicitanteUid: solicitante.id });
                      if (!res.ok) { toast.error(res.error); return; }
                      toast.success(`Automacao retomada: ${res.runId}`);
                      router.refresh();
                    });
                  }}
                >
                  Continuar automacao
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="form" className="mt-4 flex-1 overflow-y-auto pr-1">
          <EngineHost
            solicitanteUid={solicitante.id}
            initialSnapshot={initialFormSnapshot}
            mode="accordion"
          />
        </TabsContent>

        <TabsContent value="link" className="mt-4 flex-1 overflow-y-auto pr-1">
          <ApplicantLinkSection
            solicitanteUid={solicitante.id}
            shortId={shortId}
            link={link}
            onChange={onLinkChange}
          />
        </TabsContent>
      </Tabs>

      <SheetFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}

function ApplicantLinkSection({
  solicitanteUid,
  shortId,
  link,
  onChange,
}: {
  solicitanteUid: string;
  shortId: string;
  link: LatestSolicitanteShareLink | null;
  onChange: (next: LatestSolicitanteShareLink | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const url =
    link && typeof window !== "undefined"
      ? `${window.location.origin}/${shortId}/${link.token}`
      : link
        ? `/${shortId}/${link.token}`
        : null;

  async function copyUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar — tente manualmente.");
    }
  }

  function handleGenerate() {
    startTransition(async () => {
      const res = await ensureSolicitanteShareLinkAction({ solicitanteUid });
      if (res.error || !res.token) {
        toast.error(res.error ?? "Erro ao gerar link");
        return;
      }
      onChange({
        token: res.token,
        revoked: false,
        expiresAt: null,
        accessCount: 0,
      });
      toast.success("Link gerado");
    });
  }

  function handleToggleRevoked() {
    if (!link) return;
    const token = link.token;
    const wasRevoked = link.revoked;
    startTransition(async () => {
      const res = wasRevoked
        ? await reactivateSolicitanteShareLinkAction({ token })
        : await revokeSolicitanteShareLinkAction({ token });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      onChange({ ...link, revoked: !wasRevoked });
      toast.success(wasRevoked ? "Link reativado" : "Link revogado");
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const res = await regenerateSolicitanteShareLinkAction({
        solicitanteUid,
        previousToken: link?.token,
      });
      if (res.error || !res.token) {
        toast.error(res.error ?? "Erro ao gerar link");
        return;
      }
      onChange({
        token: res.token,
        revoked: false,
        expiresAt: null,
        accessCount: 0,
      });
      toast.success("Novo link gerado");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium">Link individual do solicitante</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Compartilhe este link para que o solicitante acesse e preencha apenas
          o próprio formulário — sem ver os outros membros do caso.
        </p>
      </div>

      {!link ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum link individual foi gerado ainda.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={handleGenerate}
            disabled={pending}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Gerar link
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span
              className={
                link.revoked
                  ? "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  : "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
              }
            >
              {link.revoked ? "Revogado" : "Ativo"}
            </span>
            <span className="text-xs text-muted-foreground">
              {link.accessCount} acesso{link.accessCount === 1 ? "" : "s"}
            </span>
          </div>

          {url && (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={url}
                className="h-9 font-mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyUrl}
                disabled={link.revoked}
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleRevoked}
              disabled={pending}
            >
              {link.revoked ? (
                <>
                  <Link2 className="mr-1 h-4 w-4" />
                  Reativar
                </>
              ) : (
                <>
                  <Link2Off className="mr-1 h-4 w-4" />
                  Revogar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={pending}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Gerar novo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewSolicitanteDrawer({
  solicitacaoUid,
  onSuccess,
}: {
  solicitacaoUid: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] =
    useState<Solicitante["parentesco"]>("Outro");
  const [cpf, setCpf] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome");
      return;
    }
    startTransition(async () => {
      const res = await createSolicitanteAction({
        solicitacaoUid,
        nome: nome.trim(),
        parentesco,
        cpf: cpf.trim(),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Solicitante adicionado");
      setNome("");
      setCpf("");
      setParentesco("Outro");
      onSuccess();
      router.refresh();
    });
  }

  return (
    <SheetContent side="right" className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Novo solicitante</SheetTitle>
        <SheetDescription>
          Adicione um novo solicitante a esta solicitação.
        </SheetDescription>
      </SheetHeader>

      <form className="grid gap-4 px-4" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            placeholder="Nome completo"
            required
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parentesco">Parentesco</Label>
          <Select
            value={parentesco}
            onValueChange={(v) =>
              setParentesco((v ?? "Outro") as Solicitante["parentesco"])
            }
          >
            <SelectTrigger id="parentesco" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Principal">Principal</SelectItem>
              <SelectItem value="Cônjuge">Cônjuge</SelectItem>
              <SelectItem value="Filho(a)">Filho(a)</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.currentTarget.value)}
          />
        </div>

        <SheetFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
