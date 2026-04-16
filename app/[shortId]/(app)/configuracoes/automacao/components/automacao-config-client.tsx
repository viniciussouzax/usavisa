"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/layout/page-header";
import { updateAutomacaoConfigAction } from "@/shared/behaviors/organizacao/actions/update-automacao-config.action";

type Config = {
  maxRetries: number;
  cooldownRetry1Min: number;
  cooldownRetry2Min: number;
  timeoutPorRunMin: number;
  custoMaxPorRunUsd: number;
  retryAutoEmFalha: boolean;
};

type Props = {
  organizacaoUid: string;
  initialConfig: Config;
};

export function AutomacaoConfigClient({ organizacaoUid, initialConfig }: Props) {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updateAutomacaoConfigAction({ organizacaoUid, config });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Configuracoes salvas");
    });
  }

  function setField<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <PageHeader
        title="Automacao"
        description="Configure o comportamento dos actors (retry, timeout, limites de custo)"
      />

      <div className="mx-auto max-w-xl px-6 py-6">
        <div className="grid gap-6">

          <div className="grid gap-2">
            <Label>Retries automaticos (alem da tentativa original)</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={config.maxRetries}
              onChange={(e) => setField("maxRetries", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">0 = sem retry, so a tentativa original. Padrao: 2</p>
          </div>

          <div className="grid gap-2">
            <Label>Cooldown 1o retry (minutos)</Label>
            <Input
              type="number"
              min={1}
              max={360}
              value={config.cooldownRetry1Min}
              onChange={(e) => setField("cooldownRetry1Min", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Cooldown 2o retry (minutos)</Label>
            <Input
              type="number"
              min={1}
              max={720}
              value={config.cooldownRetry2Min}
              onChange={(e) => setField("cooldownRetry2Min", Number(e.target.value))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Timeout por run (minutos)</Label>
            <Input
              type="number"
              min={5}
              max={60}
              value={config.timeoutPorRunMin}
              onChange={(e) => setField("timeoutPorRunMin", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Se a run exceder esse tempo, e abortada. Padrao: 15</p>
          </div>

          <div className="grid gap-2">
            <Label>Custo maximo por run (USD)</Label>
            <Input
              type="number"
              min={0.01}
              max={10}
              step={0.01}
              value={config.custoMaxPorRunUsd}
              onChange={(e) => setField("custoMaxPorRunUsd", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Safety net — aborta se exceder. Padrao: $0.50</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Retry automatico em falha tecnica</Label>
              <p className="text-xs text-muted-foreground">Desligado = todo retry e manual (assessor clica "Continuar")</p>
            </div>
            <Switch
              checked={config.retryAutoEmFalha}
              onCheckedChange={(v) => setField("retryAutoEmFalha", v)}
            />
          </div>

          <Button onClick={save} disabled={pending}>
            Salvar configuracoes
          </Button>
        </div>
      </div>
    </>
  );
}
