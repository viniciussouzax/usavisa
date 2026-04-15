import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Organizacao } from "@/app/data";

type Size = "sm" | "md" | "lg";

const sizeConfig: Record<
  Size,
  { box: string; img: number; text: string }
> = {
  sm: { box: "h-8 px-2 min-w-8 text-xs", img: 32, text: "text-xs" },
  md: { box: "h-10 px-3 min-w-10 text-sm", img: 40, text: "text-sm" },
  lg: { box: "h-16 px-4 min-w-16 text-lg", img: 64, text: "text-lg" },
};

type Props = {
  organizacao: Pick<
    Organizacao,
    "shortId" | "nome" | "logoLight" | "logoDark"
  >;
  size?: Size;
  className?: string;
};

/**
 * Marca visual da organização. Usa logos diferentes conforme tema (light/dark)
 * quando disponíveis — se só uma variante existir, reutiliza em ambos os
 * temas. Se nenhuma estiver configurada, renderiza o shortId como badge.
 *
 * Convenção:
 *   logoDark  → logo "escura" (usada em fundo claro / tema light)
 *   logoLight → logo "clara"  (usada em fundo escuro / tema dark)
 */
export function OrganizacaoLogo({
  organizacao,
  size = "md",
  className,
}: Props) {
  const cfg = sizeConfig[size];
  const lightBgSrc = organizacao.logoDark ?? organizacao.logoLight;
  const darkBgSrc = organizacao.logoLight ?? organizacao.logoDark;

  if (!lightBgSrc) {
    return (
      <div
        aria-label={organizacao.nome}
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-primary font-semibold tracking-tight text-primary-foreground",
          cfg.box,
          className,
        )}
      >
        {organizacao.shortId}
      </div>
    );
  }

  const sameForBothThemes = lightBgSrc === darkBgSrc;

  return (
    <>
      <Image
        src={lightBgSrc}
        alt={organizacao.nome}
        width={cfg.img}
        height={cfg.img}
        className={cn(
          "rounded-xl object-contain",
          sameForBothThemes ? "block" : "block dark:hidden",
          className,
        )}
      />
      {!sameForBothThemes && darkBgSrc && (
        <Image
          src={darkBgSrc}
          alt={organizacao.nome}
          width={cfg.img}
          height={cfg.img}
          className={cn(
            "hidden rounded-xl object-contain dark:block",
            className,
          )}
        />
      )}
    </>
  );
}
