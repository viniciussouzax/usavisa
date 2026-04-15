import { Hammer } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Hammer className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Em construção.</p>
    </div>
  );
}
