"use client";

import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { AlertField } from "../../schema/primitives";

type Props = { field: AlertField };

const styles: Record<
  NonNullable<AlertField["alertStyle"]>,
  { container: string; Icon: typeof AlertTriangle }
> = {
  info: {
    container: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    Icon: Info,
  },
  warning: {
    container:
      "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
    Icon: AlertTriangle,
  },
  danger: {
    container:
      "border-destructive/40 bg-destructive/10 text-destructive",
    Icon: XCircle,
  },
};

export function AlertFieldRenderer({ field }: Props) {
  const { container, Icon } = styles[field.alertStyle ?? "info"];
  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${container}`}
      role={field.alertStyle === "danger" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex flex-col gap-1">
        {field.label && <strong className="text-sm">{field.label}</strong>}
        <p className="text-sm">{field.text}</p>
      </div>
    </div>
  );
}
