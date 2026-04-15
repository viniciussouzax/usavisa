"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  ExternalLink,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OrgPublicLink } from "@/shared/models/org-public-link";
import { createPublicLinkAction } from "@/shared/behaviors/org-public-link/actions/create-public-link.action";
import { updatePublicLinkAction } from "@/shared/behaviors/org-public-link/actions/update-public-link.action";
import { deletePublicLinkAction } from "@/shared/behaviors/org-public-link/actions/delete-public-link.action";
import { reorderPublicLinksAction } from "@/shared/behaviors/org-public-link/actions/reorder-public-links.action";
import { updateHotpageTextsAction } from "@/shared/behaviors/org-public-link/actions/update-hotpage-texts.action";

type OrgTexts = {
  tagline: string | null;
  descricao: string | null;
  footerText: string | null;
};

type Props = {
  shortId: string;
  initialOrg: OrgTexts;
  initialLinks: OrgPublicLink[];
};

const ICON_SUGGESTIONS = ["📅", "💬", "📄", "📋", "📷", "🎥", "🔗", "✉️", "🌐"];

export function HotpageEditor({ shortId, initialOrg, initialLinks }: Props) {
  const [texts, setTexts] = useState<OrgTexts>(initialOrg);
  const [links, setLinks] = useState<OrgPublicLink[]>(initialLinks);
  const [savingTexts, startSaveTexts] = useTransition();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<OrgPublicLink | "new" | null>(null);

  function saveTexts() {
    startSaveTexts(async () => {
      const res = await updateHotpageTextsAction({
        shortId,
        tagline: texts.tagline,
        descricao: texts.descricao,
        footerText: texts.footerText,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Textos salvos");
    });
  }

  function toggleActive(link: OrgPublicLink) {
    startTransition(async () => {
      const res = await updatePublicLinkAction({ id: link.id, ativo: !link.ativo });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, ativo: !l.ativo } : l)),
      );
    });
  }

  function deleteLink(link: OrgPublicLink) {
    if (!confirm(`Excluir o link "${link.label}"?`)) return;
    startTransition(async () => {
      const res = await deletePublicLinkAction({ id: link.id });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success("Link excluído");
    });
  }

  function move(link: OrgPublicLink, direction: -1 | 1) {
    const idx = links.findIndex((l) => l.id === link.id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= links.length) return;
    const next = links.slice();
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setLinks(next);
    startTransition(async () => {
      const res = await reorderPublicLinksAction({
        shortId,
        orderedIds: next.map((l) => l.id),
      });
      if (res.error) {
        toast.error(res.error);
        setLinks(links); // reverte
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Página pública"
        description={`/${shortId}`}
        backHref={`/${shortId}/organizacao`}
        action={
          <Link href={`/${shortId}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-1 h-4 w-4" />
              Ver página
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-8 px-6 py-4">
        {/* IDENTIDADE */}
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <header>
            <h2 className="text-sm font-semibold">Identidade</h2>
            <p className="text-xs text-muted-foreground">
              Textos que aparecem em /{shortId}.
            </p>
          </header>

          <div className="grid gap-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              maxLength={120}
              placeholder="Seu visto americano com segurança e agilidade"
              value={texts.tagline ?? ""}
              onChange={(e) =>
                setTexts((t) => ({
                  ...t,
                  tagline: e.currentTarget.value || null,
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              rows={3}
              maxLength={300}
              placeholder="Somos especializados em vistos B1/B2, F1 e J1. Atendemos famílias e profissionais em todo o Brasil."
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={texts.descricao ?? ""}
              onChange={(e) =>
                setTexts((t) => ({
                  ...t,
                  descricao: e.currentTarget.value || null,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Até 300 caracteres.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="footer">Rodapé</Label>
            <Input
              id="footer"
              maxLength={200}
              placeholder={`© ${new Date().getFullYear()} ${""}`}
              value={texts.footerText ?? ""}
              onChange={(e) =>
                setTexts((t) => ({
                  ...t,
                  footerText: e.currentTarget.value || null,
                }))
              }
            />
          </div>

          <div>
            <Button size="sm" onClick={saveTexts} disabled={savingTexts}>
              {savingTexts ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Salvar textos
                </>
              )}
            </Button>
          </div>
        </section>

        {/* LINKS */}
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Links</h2>
              <p className="text-xs text-muted-foreground">
                Botões exibidos na página pública. Arraste com as setas pra
                reordenar.
              </p>
            </div>
            <Button size="sm" onClick={() => setEditing("new")}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </header>

          {links.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Nenhum link cadastrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <li
                  key={link.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(link, -1)}
                      disabled={idx === 0 || pending}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(link, 1)}
                      disabled={idx === links.length - 1 || pending}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {link.icon && (
                    <span className="text-xl" aria-hidden>
                      {link.icon}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {link.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {link.url}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleActive(link)}
                    disabled={pending}
                    className={
                      link.ativo
                        ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                        : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {link.ativo ? "Ativo" : "Inativo"}
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(link)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLink(link)}
                    aria-label="Excluir"
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Abrir em nova aba"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        {editing !== null && (
          <LinkEditor
            shortId={shortId}
            link={editing === "new" ? null : editing}
            onSaved={(saved) => {
              setLinks((prev) => {
                const exists = prev.some((l) => l.id === saved.id);
                return exists
                  ? prev.map((l) => (l.id === saved.id ? saved : l))
                  : [...prev, saved];
              });
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </Sheet>
    </>
  );
}

function LinkEditor({
  shortId,
  link,
  onSaved,
  onClose,
}: {
  shortId: string;
  link: OrgPublicLink | null;
  onSaved: (link: OrgPublicLink) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(link?.label ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [descricao, setDescricao] = useState(link?.descricao ?? "");
  const [icon, setIcon] = useState(link?.icon ?? "");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      if (link) {
        const res = await updatePublicLinkAction({
          id: link.id,
          label,
          url,
          descricao: descricao || null,
          icon: icon || null,
        });
        if (res.error) {
          toast.error(res.error);
          return;
        }
        onSaved({
          ...link,
          label,
          url,
          descricao: descricao || null,
          icon: icon || null,
        });
        toast.success("Link atualizado");
      } else {
        const res = await createPublicLinkAction({
          shortId,
          label,
          url,
          descricao: descricao || undefined,
          icon: icon || undefined,
        });
        if (res.error || !res.id) {
          toast.error(res.error ?? "Erro ao criar");
          return;
        }
        onSaved({
          id: res.id,
          organizacaoUid: "", // não é exibido aqui
          label,
          url,
          descricao: descricao || null,
          icon: icon || null,
          ordem: 0,
          ativo: true,
        });
        toast.success("Link criado");
      }
    });
  }

  return (
    <SheetContent side="right" className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{link ? "Editar link" : "Adicionar link"}</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-2">
          <Label>Ícone (emoji)</Label>
          <div className="flex flex-wrap gap-1">
            {ICON_SUGGESTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className={`rounded-md border px-2 py-1 text-lg ${
                  icon === e
                    ? "border-primary bg-primary/10"
                    : "border-input hover:bg-accent"
                }`}
              >
                {e}
              </button>
            ))}
            <Input
              value={icon}
              onChange={(e) => setIcon(e.currentTarget.value.slice(0, 8))}
              placeholder="Custom"
              className="h-9 w-24"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="link-label">Nome</Label>
          <Input
            id="link-label"
            maxLength={80}
            value={label}
            onChange={(e) => setLabel(e.currentTarget.value)}
            placeholder="Ex: Documentos necessários"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="link-desc">Descrição (opcional)</Label>
          <Input
            id="link-desc"
            maxLength={200}
            value={descricao}
            onChange={(e) => setDescricao(e.currentTarget.value)}
            placeholder="Linha menor abaixo do nome"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="link-url">URL</Label>
          <Input
            id="link-url"
            value={url}
            onChange={(e) => setUrl(e.currentTarget.value)}
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      <SheetFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={submit}
          disabled={pending || !label.trim() || !url.trim()}
        >
          {pending ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Salvar link
            </>
          )}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}
