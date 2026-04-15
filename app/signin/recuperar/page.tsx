import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { resolveHomeUrl } from "@/lib/auth/home-url";
import { RecuperarForm } from "../components/recuperar-form";

export default async function RecuperarSenhaPage() {
  const { user } = await getUser();
  if (user) redirect(await resolveHomeUrl(user.id, user.role));

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center w-full pt-16 pb-24">
          <div className="w-full max-w-md">
            <div className="border border-border rounded-lg bg-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                  Recuperar senha
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Informe o email da sua conta e enviaremos um link para
                  redefinir a senha.
                </p>
              </div>
              <RecuperarForm signinHref="/signin" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
