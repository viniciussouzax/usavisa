"use client";

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useRedefinirSenha } from "../behaviors/redefinir-senha/use-redefinir-senha";

type Props = {
  token: string | null;
  signinHref: string;
};

export function RedefinirForm({ token, signinHref }: Props) {
  const { state, formAction, isLoading } = useRedefinirSenha();

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive">
          Token ausente ou inválido. Abra o link diretamente do email que você
          recebeu.
        </p>
        <Link
          href={signinHref}
          className="text-sm font-medium text-foreground underline"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm text-foreground">Senha redefinida com sucesso.</p>
        <Link
          href={signinHref}
          className="mt-2 h-10 inline-flex items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Nova senha
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="block w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo de 8 caracteres.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-foreground"
        >
          Confirmar senha
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            id="confirm"
            name="confirm"
            required
            minLength={8}
            placeholder="••••••••"
            className="block w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isLoading ? "Salvando..." : "Redefinir senha"}
      </button>

      <div className="text-center">
        <Link
          href={signinHref}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Voltar ao login
        </Link>
      </div>
    </form>
  );
}
