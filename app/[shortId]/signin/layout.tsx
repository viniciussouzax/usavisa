import { getOrganizacaoByShortId } from "@/shared/models/organizacao";
import { ForceLightTheme } from "../[token]/components/force-light-theme";
import { OrgThemeInjector } from "../[token]/components/org-theme-injector";

export default async function SigninLayout({
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
