"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plug, Plus, Settings2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { loadGoogleFonts } from "@/lib/google-fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontPicker } from "@/components/layout/font-picker";
import { IntegracaoDrawer } from "@/components/layout/integracao-drawer";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  PLANOS,
  PLANO_LABELS,
  roleLabel,
  roleTone,
  type Assessor,
  type AssessorRole,
  type Integracao,
  type Organizacao,
  type Plano,
} from "@/app/data";
import { updateOrganizacaoAction } from "@/shared/behaviors/organizacao/actions/update-organizacao.action";
import { createAssessorAction } from "@/shared/behaviors/assessor/actions/create-assessor.action";
import { updateAssessorAction } from "@/shared/behaviors/assessor/actions/update-assessor.action";
import { removeAssessorAction } from "@/shared/behaviors/assessor/actions/remove-assessor.action";

type Props = {
  organizacao: Organizacao;
  assessores: Assessor[];
  integracoes: Integracao[];
  solicitacoesCount: number;
  isMasterUser?: boolean;
  backHref?: string;
};

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}

function MarcaThumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded border border-dashed border-border text-xs text-muted-foreground">
        —
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 rounded border border-border object-contain"
    />
  );
}

function MarcaPreview({
  organizacao,
}: {
  organizacao: Pick<
    Organizacao,
    "logoLight" | "logoDark" | "iconLight" | "iconDark" | "shortId"
  >;
}) {
  const hasAnything =
    organizacao.logoLight ||
    organizacao.logoDark ||
    organizacao.iconLight ||
    organizacao.iconDark;

  if (!hasAnything) {
    return (
      <span className="text-sm text-muted-foreground">
        Usa `{organizacao.shortId}` como marca (nenhuma imagem configurada).
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <MarcaThumb src={organizacao.logoDark} alt="Logo escura" />
        <MarcaThumb src={organizacao.logoLight} alt="Logo clara" />
      </div>
      <span className="text-xs text-muted-foreground">Logo</span>
      <div className="flex items-center gap-1">
        <MarcaThumb src={organizacao.iconDark} alt="Ícone escuro" />
        <MarcaThumb src={organizacao.iconLight} alt="Ícone claro" />
      </div>
      <span className="text-xs text-muted-foreground">Ícone</span>
    </div>
  );
}

type WhiteLabelSection = "shortId" | "cores" | "marca" | "tipografia";

export function OrganizacaoDetailClient({
  organizacao,
  assessores,
  integracoes,
  solicitacoesCount,
  isMasterUser = false,
  backHref,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selected, setSelected] = useState<Assessor | null>(null);
  const [selectedIntegracao, setSelectedIntegracao] =
    useState<Integracao | null>(null);
  const [wlEditing, setWlEditing] = useState<WhiteLabelSection | null>(null);

  useEffect(() => {
    loadGoogleFonts([organizacao.fontTitle, organizacao.fontBody]);
  }, [organizacao.fontTitle, organizacao.fontBody]);

  return (
    <>
      <PageHeader
        title={organizacao.nome}
        description={`${organizacao.shortId} · #${organizacao.id} · ${assessores.length} assessores · ${solicitacoesCount} solicitações${
          organizacao.ativa ? "" : " · inativa"
        }`}
        backHref={backHref}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={`/${organizacao.shortId}/configuracoes/pagina-publica`}
                />
              }
            >
              Página pública
            </Button>
            <Sheet open={addOpen} onOpenChange={setAddOpen}>
              <SheetTrigger render={<Button size="sm" />}>
                <UserPlus className="mr-1 h-4 w-4" />
                Adicionar Assessor
              </SheetTrigger>
              <NewAssessorDrawer
                shortId={organizacao.shortId}
                onSuccess={() => setAddOpen(false)}
              />
            </Sheet>
          </div>
        }
      />

      <div className="px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Informações cadastrais
          </h2>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-44">Nome fantasia</TableCell>
                <TableCell>{organizacao.nome}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-44">Razão social</TableCell>
                <TableCell className={organizacao.razaoSocial ? "" : "text-muted-foreground"}>
                  {organizacao.razaoSocial ?? "Não informado"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-44">CNPJ</TableCell>
                <TableCell className={organizacao.cnpj ? "font-mono" : "text-muted-foreground"}>
                  {organizacao.cnpj
                    ? organizacao.cnpj.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                        "$1.$2.$3/$4-$5",
                      )
                    : "Não informado"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-44">Email</TableCell>
                <TableCell className={organizacao.email ? "" : "text-muted-foreground"}>
                  {organizacao.email ?? "Não informado"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-44">WhatsApp</TableCell>
                <TableCell className="font-mono">
                  {organizacao.whatsapp ? `+${organizacao.whatsapp}` : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-44">Plano</TableCell>
                <TableCell className="capitalize">{organizacao.plano}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            White label
          </h2>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow
                className="cursor-pointer"
                onClick={() => setWlEditing("shortId")}
              >
                <TableCell className="w-44">Short ID</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {organizacao.shortId}
                </TableCell>
              </TableRow>

              <TableRow
                className="cursor-pointer"
                onClick={() => setWlEditing("cores")}
              >
                <TableCell className="w-44">Cores</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-5 w-5 rounded border border-border"
                      style={{ background: organizacao.color1 }}
                    />
                    <span
                      className="h-5 w-5 rounded border border-border"
                      style={{ background: organizacao.color2 }}
                    />
                    <span
                      className="h-5 w-5 rounded border border-border"
                      style={{ background: organizacao.color3 }}
                    />
                  </div>
                </TableCell>
              </TableRow>

              <TableRow
                className="cursor-pointer"
                onClick={() => setWlEditing("marca")}
              >
                <TableCell className="w-44">Marca</TableCell>
                <TableCell>
                  <MarcaPreview organizacao={organizacao} />
                </TableCell>
              </TableRow>

              <TableRow
                className="cursor-pointer"
                onClick={() => setWlEditing("tipografia")}
              >
                <TableCell className="w-44">Tipografia</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 text-sm">
                    <span style={{ fontFamily: organizacao.fontTitle }}>
                      <span className="mr-1 text-xs text-muted-foreground">
                        Títulos:
                      </span>
                      Aa — {organizacao.fontTitle}
                    </span>
                    <span style={{ fontFamily: organizacao.fontBody }}>
                      <span className="mr-1 text-xs text-muted-foreground">
                        Parágrafo:
                      </span>
                      Aa — {organizacao.fontBody}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <Sheet
          open={wlEditing !== null}
          onOpenChange={(v) => !v && setWlEditing(null)}
        >
          {wlEditing === "shortId" && (
            <ShortIdDrawer
              organizacao={organizacao}
              onClose={() => setWlEditing(null)}
            />
          )}
          {wlEditing === "cores" && (
            <CoresDrawer
              organizacao={organizacao}
              onClose={() => setWlEditing(null)}
            />
          )}
          {wlEditing === "marca" && (
            <MarcaDrawer
              organizacao={organizacao}
              onClose={() => setWlEditing(null)}
            />
          )}
          {wlEditing === "tipografia" && (
            <TipografiaDrawer
              organizacao={organizacao}
              onClose={() => setWlEditing(null)}
            />
          )}
        </Sheet>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Assessores vinculados
          </h2>

          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Configurações da organização"
                />
              }
            >
              <Settings2 className="h-4 w-4" />
            </SheetTrigger>
            <SettingsDrawer
              organizacao={organizacao}
              isMasterUser={isMasterUser}
            />
          </Sheet>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessores.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum assessor vinculado. Clique em &ldquo;Adicionar Assessor&rdquo;.
                  </TableCell>
                </TableRow>
              ) : (
                assessores.map((assessor) => (
                  <TableRow
                    key={assessor.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(assessor)}
                  >
                    <TableCell>{assessor.nome}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {assessor.email}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={roleTone(assessor.role)}>
                        {roleLabel(assessor.role)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={assessor.ativo ? "success" : "neutral"}>
                        {assessor.ativo ? "Ativo" : "Inativo"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(assessor.criadoEm).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Sheet
            open={selected !== null}
            onOpenChange={(v) => !v && setSelected(null)}
          >
            {selected && (
              <EditAssessorDrawer
                assessor={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </Sheet>
        </div>

        <div className="mt-8 mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Integrações
          </h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integracoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma integração configurada.
                  </TableCell>
                </TableRow>
              ) : (
                integracoes.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedIntegracao(item)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Plug className="h-4 w-4 text-muted-foreground" />
                        {item.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.categoria}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.descricao}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={item.conectado ? "success" : "neutral"}
                      >
                        {item.conectado ? "Conectado" : "Não conectado"}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Sheet
            open={selectedIntegracao !== null}
            onOpenChange={(v) => !v && setSelectedIntegracao(null)}
          >
            {selectedIntegracao && (
              <IntegracaoDrawer
                integracao={selectedIntegracao}
                scope={{ type: "org", organizacaoUid: organizacao.uid }}
                onClose={() => setSelectedIntegracao(null)}
              />
            )}
          </Sheet>
        </div>
      </div>
    </>
  );
}

function EditAssessorDrawer({
  assessor,
  onClose,
}: {
  assessor: Assessor;
  onClose: () => void;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(assessor.nome);
  const [role, setRole] = useState<AssessorRole>(assessor.role);
  const [ativo, setAtivo] = useState(assessor.ativo);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateAssessorAction({
        id: assessor.id,
        nome,
        role,
        ativo,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Assessor atualizado");
      router.refresh();
      onClose();
    });
  }

  function remove() {
    if (!confirm(`Remover ${assessor.nome} desta organização?`)) return;
    startTransition(async () => {
      const res = await removeAssessorAction({ id: assessor.id });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Assessor removido");
      router.refresh();
      onClose();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {assessor.nome.charAt(0)}
          </div>
          <div>
            <SheetTitle>{assessor.nome}</SheetTitle>
            <SheetDescription>{assessor.email}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <form className="flex flex-col gap-5 overflow-y-auto px-4" onSubmit={submit}>
        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dados
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="edit-nome">Nome</Label>
            <Input
              id="edit-nome"
              value={nome}
              onChange={(e) => setNome(e.currentTarget.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={assessor.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email do login não pode ser alterado por aqui.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-role">Papel</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole((v ?? role) as AssessorRole)}
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Dono</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Assessor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex flex-col">
            <Label htmlFor="edit-ativo" className="text-sm font-medium">
              Assessor ativo
            </Label>
            <p className="text-xs text-muted-foreground">
              Desativado não consegue acessar a plataforma.
            </p>
          </div>
          <Switch id="edit-ativo" checked={ativo} onCheckedChange={setAtivo} />
        </section>

        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <span className="text-sm">
            {new Date(assessor.criadoEm).toLocaleDateString("pt-BR")}
          </span>
        </div>

        <SheetFooter className="flex-row justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={remove}
            disabled={pending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Remover
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

function NewAssessorDrawer({
  shortId,
  onSuccess,
}: {
  shortId: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<AssessorRole>("member");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createAssessorAction({
        shortId,
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Assessor criado");
      router.refresh();
      onSuccess();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Adicionar assessor</SheetTitle>
        <SheetDescription>
          Cadastre um assessor diretamente com email e senha.
        </SheetDescription>
      </SheetHeader>

      <form className="grid gap-4 px-4" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="assessor-nome">Nome</Label>
          <Input
            id="assessor-nome"
            placeholder="Nome completo"
            required
            value={nome}
            onChange={(e) => setNome(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assessor-email">Email</Label>
          <Input
            id="assessor-email"
            type="email"
            placeholder="email@dominio.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assessor-senha">Senha</Label>
          <Input
            id="assessor-senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="assessor-role">Papel</Label>
          <Select
            value={role}
            onValueChange={(v) => setRole((v ?? role) as AssessorRole)}
          >
            <SelectTrigger id="assessor-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Dono</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Assessor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SheetFooter>
          <Button type="submit" disabled={pending}>
            <Plus className="mr-1 h-4 w-4" />
            {pending ? "Criando..." : "Criar"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

function SettingsDrawer({
  organizacao,
  isMasterUser,
}: {
  organizacao: Organizacao;
  isMasterUser: boolean;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(organizacao.nome);
  const [razaoSocial, setRazaoSocial] = useState(organizacao.razaoSocial ?? "");
  const [cnpj, setCnpj] = useState(organizacao.cnpj ?? "");
  const [email, setEmail] = useState(organizacao.email ?? "");
  const [shortId, setShortId] = useState(organizacao.shortId);
  const [whatsapp, setWhatsapp] = useState(organizacao.whatsapp);
  const [ativa, setAtiva] = useState(organizacao.ativa);
  const [plano, setPlano] = useState<Plano>(organizacao.plano);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const payload: Parameters<typeof updateOrganizacaoAction>[0] = {
        uid: organizacao.uid,
        nome,
        razaoSocial: razaoSocial || null,
        cnpj: cnpj || null,
        email: email || null,
        whatsapp,
        ativa,
      };
      if (shortId !== organizacao.shortId) payload.shortId = shortId;
      if (isMasterUser && plano !== organizacao.plano) payload.plano = plano;
      const res = await updateOrganizacaoAction(payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Configurações salvas");
      if (payload.shortId) {
        router.push(`/${payload.shortId}/organizacao`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Configurações</SheetTitle>
        <SheetDescription>
          {organizacao.shortId} · #{organizacao.id}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 overflow-y-auto px-4">
        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Identificação
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="org-nome">Nome</Label>
            <Input
              id="org-nome"
              value={nome}
              onChange={(e) => {
                const v = e.target.value;
                setNome(v);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-razao-social">Razão social</Label>
            <Input
              id="org-razao-social"
              value={razaoSocial}
              onChange={(e) => {
                const v = e.target.value;
                setRazaoSocial(v);
              }}
              placeholder="Ex: VistoPro Consultoria LTDA"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-cnpj">CNPJ</Label>
            <Input
              id="org-cnpj"
              value={cnpj}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 14);
                setCnpj(v);
              }}
              placeholder="00000000000000"
              maxLength={14}
            />
            <p className="text-xs text-muted-foreground">
              14 dígitos, sem pontos ou traços. Opcional.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-email">Email da organização</Label>
            <Input
              id="org-email"
              type="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
              }}
              placeholder="contato@assessoria.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-short">Short ID</Label>
            <Input
              id="org-short"
              value={shortId}
              onChange={(e) => setShortId(e.currentTarget.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-whatsapp">WhatsApp de suporte</Label>
            <PhoneInput
              id="org-whatsapp"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="11988945503"
            />
            <p className="text-xs text-muted-foreground">
              Usado no botão de suporte nas páginas públicas dos solicitantes.
            </p>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs text-muted-foreground">UID</Label>
            <code className="block rounded bg-muted px-2 py-1 text-xs">
              {organizacao.uid}
            </code>
          </div>
        </section>

        <section className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex flex-col">
            <Label htmlFor="org-ativa" className="text-sm font-medium">
              Organização ativa
            </Label>
            <p className="text-xs text-muted-foreground">
              Desativada bloqueia o acesso de todos os assessores.
            </p>
          </div>
          <Switch id="org-ativa" checked={ativa} onCheckedChange={setAtiva} />
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plano de assinatura
            </h3>
            {!isMasterUser && (
              <span className="text-xs text-muted-foreground">Somente Master</span>
            )}
          </div>
          {isMasterUser ? (
            <Select
              value={plano}
              onValueChange={(v) => setPlano((v ?? plano) as Plano)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANOS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLANO_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              {PLANO_LABELS[organizacao.plano]}
            </div>
          )}
        </section>

        <Button size="sm" className="w-fit" onClick={save} disabled={pending}>
          Salvar alterações
        </Button>
      </div>
    </SheetContent>
  );
}

// ============================================================================
// White-label drawers (um por seção da tabela)
// ============================================================================

function ShortIdDrawer({
  organizacao,
  onClose,
}: {
  organizacao: Organizacao;
  onClose: () => void;
}) {
  const router = useRouter();
  const [shortId, setShortId] = useState(organizacao.shortId);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = shortId.trim();
    if (trimmed === organizacao.shortId) {
      onClose();
      return;
    }
    if (!confirm("Alterar o Short ID quebra links existentes com o valor antigo. Continuar?")) return;
    startTransition(async () => {
      const res = await updateOrganizacaoAction({
        uid: organizacao.uid,
        shortId: trimmed,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Short ID atualizado");
      router.push(`/${trimmed}/organizacao`);
      onClose();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Short ID</SheetTitle>
        <SheetDescription>
          Slug da organização — aparece nas URLs públicas.
        </SheetDescription>
      </SheetHeader>

      <form className="flex flex-col gap-4 px-4" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="short-id">Short ID</Label>
          <Input
            id="short-id"
            value={shortId}
            onChange={(e) => setShortId(e.currentTarget.value)}
            pattern="[a-z0-9-]+"
            required
          />
          <p className="text-xs text-muted-foreground">
            Minúsculas, números e hífen. Mudar isso quebra links existentes.
          </p>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

function CoresDrawer({
  organizacao,
  onClose,
}: {
  organizacao: Organizacao;
  onClose: () => void;
}) {
  const router = useRouter();
  const [c1, setC1] = useState(organizacao.color1);
  const [c2, setC2] = useState(organizacao.color2);
  const [c3, setC3] = useState(organizacao.color3);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrganizacaoAction({
        uid: organizacao.uid,
        color1: c1,
        color2: c2,
        color3: c3,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Cores atualizadas");
      router.refresh();
      onClose();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Cores</SheetTitle>
        <SheetDescription>
          Paleta da marca aplicada nas páginas públicas.
        </SheetDescription>
      </SheetHeader>

      <form className="flex flex-col gap-4 px-4" onSubmit={submit}>
        <ColorField id="cor-1" label="Cor 1" value={c1} onChange={setC1} />
        <ColorField id="cor-2" label="Cor 2" value={c2} onChange={setC2} />
        <ColorField id="cor-3" label="Cor 3" value={c3} onChange={setC3} />

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

function MarcaDrawer({
  organizacao,
  onClose,
}: {
  organizacao: Organizacao;
  onClose: () => void;
}) {
  const router = useRouter();
  const [logoLight, setLogoLight] = useState(organizacao.logoLight ?? "");
  const [logoDark, setLogoDark] = useState(organizacao.logoDark ?? "");
  const [iconLight, setIconLight] = useState(organizacao.iconLight ?? "");
  const [iconDark, setIconDark] = useState(organizacao.iconDark ?? "");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrganizacaoAction({
        uid: organizacao.uid,
        logoLight: logoLight.trim() || null,
        logoDark: logoDark.trim() || null,
        iconLight: iconLight.trim() || null,
        iconDark: iconDark.trim() || null,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Marca atualizada");
      router.refresh();
      onClose();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Marca</SheetTitle>
        <SheetDescription>
          Logo e ícone em versões clara e escura.
        </SheetDescription>
      </SheetHeader>

      <form className="flex flex-col gap-5 overflow-y-auto px-4" onSubmit={submit}>
        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Logo
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="logo-light">Versão clara (URL)</Label>
            <Input
              id="logo-light"
              type="url"
              value={logoLight}
              onChange={(e) => setLogoLight(e.currentTarget.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Usada em fundo escuro (tema dark).
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo-dark">Versão escura (URL)</Label>
            <Input
              id="logo-dark"
              type="url"
              value={logoDark}
              onChange={(e) => setLogoDark(e.currentTarget.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Usada em fundo claro (tema light).
            </p>
          </div>
        </section>

        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ícone
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="icon-light">Versão clara (URL)</Label>
            <Input
              id="icon-light"
              type="url"
              value={iconLight}
              onChange={(e) => setIconLight(e.currentTarget.value)}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon-dark">Versão escura (URL)</Label>
            <Input
              id="icon-dark"
              type="url"
              value={iconDark}
              onChange={(e) => setIconDark(e.currentTarget.value)}
              placeholder="https://..."
            />
          </div>
        </section>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

function TipografiaDrawer({
  organizacao,
  onClose,
}: {
  organizacao: Organizacao;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fontTitle, setFontTitle] = useState(organizacao.fontTitle);
  const [fontBody, setFontBody] = useState(organizacao.fontBody);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrganizacaoAction({
        uid: organizacao.uid,
        fontTitle,
        fontBody,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Tipografia atualizada");
      router.refresh();
      onClose();
    });
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Tipografia</SheetTitle>
        <SheetDescription>
          Famílias de fonte para títulos e parágrafos.
        </SheetDescription>
      </SheetHeader>

      <form className="flex flex-col gap-4 px-4" onSubmit={submit}>
        <FontPicker
          id="font-title"
          label="Fonte dos títulos"
          value={fontTitle}
          onChange={setFontTitle}
        />
        <FontPicker
          id="font-body"
          label="Fonte dos parágrafos"
          value={fontBody}
          onChange={setFontBody}
        />

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            Salvar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
