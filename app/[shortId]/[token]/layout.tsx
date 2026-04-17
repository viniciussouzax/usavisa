import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { ForceLightTheme } from "./components/force-light-theme";
import { OrgThemeInjector } from "./components/org-theme-injector";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const org = await getOrganizacaoByShortId(shortId);
  const primaryColor = org?.color3 ?? "";

  return (
    <>
      <ForceLightTheme />
      {primaryColor && <OrgThemeInjector color={primaryColor} />}
      {children}
    </>
  );
}
