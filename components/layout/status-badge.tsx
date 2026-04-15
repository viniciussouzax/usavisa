import { cn } from "@/lib/utils";

type BadgeTone = "warning" | "pending" | "success" | "info" | "neutral" | "danger";

const toneStyles: Record<BadgeTone, string> = {
  warning: "bg-yellow-200/70 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200",
  pending: "bg-orange-200/70 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200",
  success: "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  info: "bg-sky-200/70 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  neutral: "bg-muted text-muted-foreground",
  danger: "bg-red-200/70 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
