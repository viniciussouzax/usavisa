import { notFound, redirect } from "next/navigation";
import { SIGNIN_URL } from "@/app.config";
import { getUser } from "@/lib/auth";
import { signOut as signOutAction } from "@/shared/behaviors/signout/actions/signout";
import { ImpersonationBanner } from "@/app/admin/components/impersonation-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { isMaster } from "@/components/layout/nav-config";
import { getAssessorByUserAndOrg, getPrimaryOrgUidForUser } from "@/shared/models/assessor";
import {
  getOrganizacaoByShortId,
  getOrganizacaoByUid,
} from "@/shared/models/organizacao";

async function handleSignOut() {
  "use server";
  await signOutAction();
}

export default async function TenantAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const { user, isImpersonating } = await getUser();

  if (!user) redirect(`${SIGNIN_URL}?redirectURL=/${shortId}/solicitacoes`);

  const organizacao = await getOrganizacaoByShortId(shortId);
  if (!organizacao) notFound();

  const userIsMaster = isMaster(user.role);
  const membership = await getAssessorByUserAndOrg(user.id, organizacao.uid);
  const canAccess = userIsMaster || (membership?.ativo ?? false);
  if (!canAccess) {
    const fallbackUid = await getPrimaryOrgUidForUser(user.id);
    const fallback = fallbackUid ? await getOrganizacaoByUid(fallbackUid) : undefined;
    redirect(fallback ? `/${fallback.shortId}/solicitacoes` : "/");
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={user.role} currentOrg={organizacao} />
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
