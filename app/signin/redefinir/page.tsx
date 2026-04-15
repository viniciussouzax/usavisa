import { RedefinirForm } from "../components/redefinir-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? null;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center w-full pt-16 pb-24">
          <div className="w-full max-w-md">
            <div className="border border-border rounded-lg bg-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                  Definir nova senha
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Escolha uma nova senha para a sua conta.
                </p>
              </div>
              <RedefinirForm token={token} signinHref="/signin" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
