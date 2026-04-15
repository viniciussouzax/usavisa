import { redirect } from "next/navigation";
import { SIGNIN_URL } from "@/app.config";
import { getUser } from "@/lib/auth";
import { signOut as signOutAction } from "@/shared/behaviors/signout/actions/signout";
import { ImpersonationBanner } from "@/app/admin/components/impersonation-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { isMaster } from "@/components/layout/nav-config";
import { getPrimaryOrgUidForUser } from "@/shared/models/assessor";
import { getOrganizacaoByUid } from "@/shared/models/organizacao";

async function handleSignOut() {
  "use server";
  await signOutAction();
}

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isImpersonating } = await getUser();
  if (!user) redirect(SIGNIN_URL);
  if (!isMaster(user.role)) {
    const orgUid = await getPrimaryOrgUidForUser(user.id);
    const userOrg = orgUid ? await getOrganizacaoByUid(orgUid) : undefined;
    redirect(userOrg ? `/${userOrg.shortId}/solicitacoes` : "/");
  }

  return (
    <SidebarProvider>
      {/*
        Master fora de uma org específica: sidebar sem currentOrg. Itens de nav
        que dependem de `:orgSelf` são ocultados (resolveNavHref → null). Só
        o Menu Master aparece.
      */}
      <AppSidebar userRole={user.role} currentOrg={null} />
      <SidebarInset>
        <TopBar
          userName={user.name ?? ""}
          userEmail={user.email}
          userImage={user.image}
          onSignOut={handleSignOut}
        />
        {isImpersonating && (
          <ImpersonationBanner impersonatedUserName={user.name || user.email} />
        )}
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
