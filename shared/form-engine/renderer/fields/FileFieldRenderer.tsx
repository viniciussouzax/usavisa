"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FileField } from "../../schema/primitives";
import type { EngineAtoms } from "../../state";
import { useFieldBinding, type ArrayScope } from "../../runtime/binding";

type Props = {
  field: FileField;
  sectionId: string;
  atoms: EngineAtoms;
  arrayScope?: ArrayScope;
  /** Necessário pra autorização do upload; vem do EngineHost. */
  solicitanteUid: string;
  token?: string;
};

export function FileFieldRenderer({
  field,
  sectionId,
  atoms,
  arrayScope,
  solicitanteUid,
  token,
}: Props) {
  const b = useFieldBinding<string>(atoms, sectionId, field.id, arrayScope);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = typeof b.value === "string" ? b.value : "";

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ solicitanteUid });
      if (token) qs.set("token", token);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/form-upload?${qs.toString()}`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Falha no upload");
        return;
      }
      b.setValue(data.url);
    } catch {
      setError("Falha de rede no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Label>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={field.accept ?? "image/jpeg"}
        className="hidden"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Preview"
            className="h-24 w-24 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-1 h-4 w-4" />
                {url ? "Substituir" : "Escolher arquivo"}
              </>
            )}
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
