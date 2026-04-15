import Link from "next/link";
import SignUpForm from "./components/signup-form";

interface SignUpPageProps {
  searchParams: Promise<{
    redirectTo?: string;
    redirectURL?: string;
  }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectURL = params.redirectURL || params.redirectTo || "";

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center w-full pt-16 pb-24">
        <div className="w-full max-w-md">
          <div className="border border-border rounded-lg bg-card p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground">
                Criar conta
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Assessores são cadastrados pela própria assessoria. Se você é
                assessor, peça ao admin da sua assessoria pra te criar.
              </p>
            </div>
            <SignUpForm redirectURL={redirectURL} />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link
              href="/signin"
              className="font-medium text-foreground underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
