"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  PLANOS,
  PLANO_LABELS,
  type AssessorRole,
  type Organizacao,
  type Plano,
} from "@/app/data";
import { createOrganizacaoAction } from "@/shared/behaviors/organizacao/actions/create-organizacao.action";

type Props = {
  organizacoes: Array<
    Organizacao & { assessoresCount: number; solicitacoesCount: number }
  >;
};

export function OrganizacoesClient({ organizacoes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Organizações"
        description="Todas as organizações do sistema (acesso Master)"
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" />}>
              <Plus className="mr-1 h-4 w-4" />
              Criar Nova
            </SheetTrigger>
            <NewOrganizacaoDrawer
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </Sheet>
        }
      />

      <div className="px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Selecionar todos" />
                </TableHead>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Short ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-28 text-right">Assessores</TableHead>
                <TableHead className="w-28 text-right">Solicitações</TableHead>
                <TableHead className="w-28 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizacoes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma organização cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                organizacoes.map((org) => (
                  <TableRow
                    key={org.uid}
                    className="cursor-pointer"
                    onClick={() => router.push(`/${org.shortId}/organizacao`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`Selecionar ${org.nome}`} />
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      #{org.id}
                    </TableCell>
                    <TableCell>{org.shortId}</TableCell>
                    <TableCell>{org.nome}</TableCell>
                    <TableCell className="text-right">{org.assessoresCount}</TableCell>
                    <TableCell className="text-right">{org.solicitacoesCount}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/${org.shortId}/solicitacoes`)
                        }
                      >
                        <LogIn className="mr-1 h-3.5 w-3.5" />
                        Acessar
                      </Button>
                    </TableCell>
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

type AssessorDraft = {
  key: string;
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  role: AssessorRole;
};

function makeEmptyAssessor(): AssessorDraft {
  return {
    key: crypto.randomUUID(),
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    role: "member",
  };
}

function NewOrganizacaoDrawer({ onSuccess }: { onSuccess: () => void }) {
  const [assessores, setAssessores] = useState<AssessorDraft[]>(() => [
    { ...makeEmptyAssessor(), role: "owner" },
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plano, setPlano] = useState<Plano>("free");

  function updateAssessor(key: string, patch: Partial<AssessorDraft>) {
    setAssessores((list) =>
      list.map((a) => (a.key === key ? { ...a, ...patch } : a)),
    );
  }

  function removeAssessor(key: string) {
    setAssessores((list) => list.filter((a) => a.key !== key));
  }

  function addAssessor() {
    setAssessores((list) => [...list, makeEmptyAssessor()]);
  }

  return (
    <SheetContent side="right" className="sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>Nova organização</SheetTitle>
        <SheetDescription>
          Cadastre a organização e seus assessores de uma vez. Pelo menos um
          assessor deve ser marcado como Dono.
        </SheetDescription>
      </SheetHeader>

      <form
        className="flex flex-col gap-6 overflow-y-auto px-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          const res = await createOrganizacaoAction({
            nome: String(fd.get("nome") ?? "").trim(),
            cnpj: String(fd.get("cnpj") ?? "").trim(),
            shortId: String(fd.get("shortId") ?? "").trim(),
            whatsapp: String(fd.get("whatsapp") ?? "").trim(),
            plano,
            assessores: assessores.map((a) => ({
              nome: a.nome,
              email: a.email,
              cpf: a.cpf ?? "",
              senha: a.senha,
              role: a.role as "owner" | "member",
            })),
          });
          setPending(false);
          if (res.error) {
            setError(res.error);
            return;
          }
          onSuccess();
        }}
      >
        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Identificação
          </h3>
          <div className="grid gap-2">
            <Label htmlFor="org-nome">Nome</Label>
            <Input
              id="org-nome"
              name="nome"
              placeholder="Ex: VistoPro Consultoria"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-shortid">Short ID</Label>
            <Input
              id="org-shortid"
              name="shortId"
              placeholder="Ex: vistopro"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-xs text-muted-foreground">
              Somente minúsculas, números e hífen. Aparece em URLs.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-whatsapp">WhatsApp de suporte</Label>
            <Input
              id="org-whatsapp"
              name="whatsapp"
              placeholder="5511999999999"
              pattern="[0-9]+"
              required
            />
            <p className="text-xs text-muted-foreground">
              Formato internacional sem + ou espaços. Ex: 55 (Brasil) + 11 (DDD) + número.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-cnpj">CNPJ</Label>
            <Input
              id="org-cnpj"
              name="cnpj"
              placeholder="00000000000000"
              pattern="[0-9]{14}"
              maxLength={14}
            />
            <p className="text-xs text-muted-foreground">
              14 dígitos, sem pontos ou traços. Opcional.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org-plano">Plano de assinatura</Label>
            <Select value={plano} onValueChange={(v) => v && setPlano(v as Plano)}>
              <SelectTrigger id="org-plano">
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
          </div>
        </section>

        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assessores ({assessores.length})
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addAssessor}
              className="h-8"
            >
              <Plus className="mr-1 h-4 w-4" />
              Adicionar assessor
            </Button>
          </div>

          {assessores.map((a, idx) => (
            <div
              key={a.key}
              className="grid gap-3 rounded-md border border-border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Assessor #{idx + 1}
                </span>
                {assessores.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssessor(a.key)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    aria-label="Remover assessor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`assessor-nome-${a.key}`}>Nome</Label>
                <Input
                  id={`assessor-nome-${a.key}`}
                  value={a.nome}
                  onChange={(e) => updateAssessor(a.key, { nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`assessor-email-${a.key}`}>Email</Label>
                  <Input
                    id={`assessor-email-${a.key}`}
                    type="email"
                    value={a.email}
                    onChange={(e) => updateAssessor(a.key, { email: e.target.value })}
                    placeholder="email@dominio.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`assessor-senha-${a.key}`}>Senha</Label>
                  <Input
                    id={`assessor-senha-${a.key}`}
                    type="password"
                    value={a.senha}
                    onChange={(e) => updateAssessor(a.key, { senha: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`assessor-cpf-${a.key}`}>CPF</Label>
                <Input
                  id={`assessor-cpf-${a.key}`}
                  value={a.cpf}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                    updateAssessor(a.key, { cpf: val });
                  }}
                  placeholder="00000000000"
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">
                  11 dígitos, sem pontos ou traços. Opcional.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`assessor-role-${a.key}`}>Papel</Label>
                <Select
                  value={a.role}
                  onValueChange={(v) =>
                    updateAssessor(a.key, { role: v as AssessorRole })
                  }
                >
                  <SelectTrigger id={`assessor-role-${a.key}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Dono</SelectItem>
                    <SelectItem value="member">Assessor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <SheetFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar organização"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
