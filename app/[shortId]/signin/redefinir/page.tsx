import { notFound } from "next/navigation";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { RedefinirForm } from "@/app/signin/components/redefinir-form";
import { BrandedSigninShell } from "../components/branded-shell";

export default async function BrandedRedefinirSenhaPage({
  params,
  searchParams,
}: {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { shortId } = await params;

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const sp = await searchParams;
  const token = sp.token ?? null;

  return (
    <BrandedSigninShell
      organizacao={organizacao}
      subtitle="Definir nova senha"
      footerMessage="Problemas com o link? Entre em contato pelo"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Definir nova senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha uma nova senha para acessar {organizacao.nome}.
        </p>
      </div>
      <RedefinirForm token={token} signinHref={`/${shortId}/signin`} />
    </BrandedSigninShell>
  );
}
