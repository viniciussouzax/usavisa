"use client";

import { useState } from "react";
import { Plug } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { IntegracaoDrawer } from "@/components/layout/integracao-drawer";
import type { Integracao } from "@/app/data";

type Props = {
  integracoes: Integracao[];
};

export function IntegracoesClient({ integracoes }: Props) {
  const [selected, setSelected] = useState<Integracao | null>(null);

  return (
    <>
      <PageHeader
        title="Integrações"
        description="Serviços externos conectados à plataforma (acesso Master)"
      />

      <div className="px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Selecionar todas" />
                </TableHead>
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
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma integração disponível.
                  </TableCell>
                </TableRow>
              ) : (
                integracoes.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={`Selecionar ${item.nome}`} />
                    </TableCell>
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
                      <StatusBadge tone={item.conectado ? "success" : "neutral"}>
                        {item.conectado ? "Conectado" : "Não conectado"}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        {selected && (
          <IntegracaoDrawer
            integracao={selected}
            scope={{ type: "global" }}
            onClose={() => setSelected(null)}
          />
        )}
      </Sheet>
    </>
  );
}
