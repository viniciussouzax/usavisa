import { redirect } from "next/navigation";
import SignInForm from "./components/signin-form";
import { getUser } from "@/lib/auth";
import { resolveHomeUrl } from "@/lib/auth/home-url";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; redirectURL?: string }>;
}) {
  const { user } = await getUser();
  if (user) redirect(await resolveHomeUrl(user.id, user.role));

  const sp = await searchParams;
  const redirectURL = sp.redirectURL || sp.redirectTo || "";

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center w-full pt-16 pb-24">
          <div className="w-full max-w-md">
            <div className="border border-border rounded-lg bg-card p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                  Área Master
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Acesso restrito à administração da plataforma.
                </p>
              </div>
              <SignInForm redirectURL={redirectURL} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
