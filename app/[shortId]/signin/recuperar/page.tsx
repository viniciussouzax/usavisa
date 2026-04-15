import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { RecuperarForm } from "@/app/signin/components/recuperar-form";
import { BrandedSigninShell } from "../components/branded-shell";

export default async function BrandedRecuperarSenhaPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const { user } = await getUser();
  if (user) redirect(`/${shortId}/solicitacoes`);

  return (
    <BrandedSigninShell
      organizacao={organizacao}
      subtitle="Recuperar senha"
      footerMessage="Não consegue acessar? Entre em contato pelo"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Recuperar senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe o email da sua conta em {organizacao.nome} e enviaremos um
          link para redefinir a senha.
        </p>
      </div>
      <RecuperarForm shortId={shortId} signinHref={`/${shortId}/signin`} />
    </BrandedSigninShell>
  );
}
