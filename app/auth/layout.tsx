import { Suspense } from "react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { resolveHomeUrl } from "@/lib/auth/home-url";
import { AuthHeader } from "./components/auth-header";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getUser();

  if (user) {
    redirect(await resolveHomeUrl(user.id, user.role));
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <AuthHeader />
      </Suspense>
      {children}
    </div>
  );
}
