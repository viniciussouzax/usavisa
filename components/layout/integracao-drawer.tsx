"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Plug, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { Integracao } from "@/app/data";
import { upsertOrgIntegrationAction } from "@/shared/behaviors/integration/actions/upsert-org-integration.action";
import { upsertGlobalIntegrationAction } from "@/shared/behaviors/integration/actions/upsert-global-integration.action";

type Scope =
  | { type: "global" }
  | { type: "org"; organizacaoUid: string };

type Props = {
  integracao: Integracao;
  scope: Scope;
  onClose: () => void;
};

/**
 * Drawer de edição de integração. Reusado em /integracoes (global master) e
 * na página de organização (per-org). Inputs dinâmicos a partir de
 * `integracao.fields`; valores iniciais vêm de `integracao.config`.
 */
export function IntegracaoDrawer({ integracao, scope, onClose }: Props) {
  const router = useRouter();
  const initialConfig = integracao.config ?? {};
  const [conectado, setConectado] = useState(integracao.conectado);
  const [config, setConfig] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of integracao.fields) init[f.key] = initialConfig[f.key] ?? "";
    return init;
  });
  const [pending, startTransition] = useTransition();

  function persist(ativo: boolean) {
    startTransition(async () => {
      const res =
        scope.type === "global"
          ? await upsertGlobalIntegrationAction({
              integrationId: integracao.id,
              config,
              ativo,
            })
          : await upsertOrgIntegrationAction({
              organizacaoUid: scope.organizacaoUid,
              integrationId: integracao.id,
              config,
              ativo,
            });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(ativo ? "Integração salva" : "Integração desativada");
      router.refresh();
      onClose();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (conectado) {
      for (const f of integracao.fields) {
        if (f.required && !config[f.key]?.trim()) {
          toast.error(`Campo obrigatório: ${f.label}`);
          return;
        }
      }
    }
    persist(conectado);
  }

  function disconnect() {
    if (!confirm("Desconectar esta integração? Credenciais serão preservadas mas ficará inativa.")) return;
    setConectado(false);
    persist(false);
  }

  return (
    <SheetContent side="right">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Plug className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <SheetTitle>{integracao.nome}</SheetTitle>
            <SheetDescription>
              {integracao.categoria} · {integracao.descricao}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <form className="flex flex-col gap-5 overflow-y-auto px-4" onSubmit={submit}>
        <section className="flex items-center justify-between rounded-md border border-border p-3">
          <div className="flex flex-col">
            <Label htmlFor="int-conectado" className="text-sm font-medium">
              Integração ativa
            </Label>
            <p className="text-xs text-muted-foreground">
              Desativado, a plataforma não chama este serviço.
            </p>
          </div>
          <Switch
            id="int-conectado"
            checked={conectado}
            onCheckedChange={setConectado}
          />
        </section>

        <section className="grid gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credenciais
          </h3>
          {integracao.fields.map((field) => (
            <div key={field.key} className="grid gap-2">
              <Label htmlFor={`int-${field.key}`}>
                {field.label}
                {field.required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </Label>
              <Input
                id={`int-${field.key}`}
                name={field.key}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete="off"
                value={config[field.key] ?? ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, [field.key]: e.currentTarget.value }))
                }
              />
              {field.hint && (
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              )}
            </div>
          ))}
        </section>

        {integracao.docsUrl && (
          <a
            href={integracao.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground underline hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Documentação oficial
          </a>
        )}

        <SheetFooter className="flex-row justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={disconnect}
            disabled={pending || !integracao.conectado}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Desconectar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
