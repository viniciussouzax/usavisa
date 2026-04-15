"use client";

import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { useRecuperarSenha } from "../behaviors/recuperar-senha/use-recuperar-senha";

type Props = {
  shortId?: string;
  signinHref: string;
};

export function RecuperarForm({ shortId, signinHref }: Props) {
  const { state, formAction, isLoading } = useRecuperarSenha();

  if (state.sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-sm text-foreground">
          Se o email estiver cadastrado, você receberá um link para redefinir
          sua senha em alguns instantes.
        </p>
        <p className="text-xs text-muted-foreground">
          Verifique também a caixa de spam. O link é válido por 1 hora.
        </p>
        <Link
          href={signinHref}
          className="mt-2 text-sm font-medium text-foreground underline"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {shortId && <input type="hidden" name="shortId" value={shortId} />}

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
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="you@example.com"
            className="block w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isLoading ? "Enviando..." : "Enviar link de recuperação"}
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
