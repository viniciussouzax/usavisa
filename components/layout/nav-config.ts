import {
  Inbox,
  Play,
  Receipt,
  Plug,
  Building2,
  Briefcase,
  Database,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavRole = "master" | "assessor" | "solicitante";

export type NavItem = {
  title: string;
  /**
   * Pode usar placeholder `:orgSelf` que é substituído pelo shortId da org do
   * usuário logado em runtime via resolveNavHref().
   */
  href: string;
  icon: LucideIcon;
  children?: { title: string; href: string }[];
  requiredRole?: NavRole;
};

export type NavResolveContext = {
  currentOrgShortId?: string | null;
};

/**
 * Resolve placeholders no href. Retorna null se algum placeholder obrigatório
 * não pôde ser resolvido (ex: `:orgSelf` sem org ativa → esconder item).
 */
export function resolveNavHref(
  href: string,
  ctx: NavResolveContext,
): string | null {
  if (href.includes(":orgSelf")) {
    if (!ctx.currentOrgShortId) return null;
    return href.replace(":orgSelf", ctx.currentOrgShortId);
  }
  return href;
}

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const primaryNav: NavSection = {
  items: [
    { title: "Solicitações", href: "/:orgSelf/solicitacoes", icon: Inbox },
    { title: "Execuções", href: "/:orgSelf/execucoes", icon: Play },
    { title: "Faturamento", href: "/:orgSelf/faturamento", icon: Receipt },
    { title: "Organização", href: "/:orgSelf/organizacao", icon: Building2 },
  ],
};

export const masterNav: NavSection = {
  label: "Menu Master",
  items: [
    {
      title: "Organizações",
      href: "/organizacoes",
      icon: Briefcase,
      requiredRole: "master",
    },
    {
      title: "Integrações",
      href: "/integracoes",
      icon: Plug,
      requiredRole: "master",
    },
    {
      title: "Usuários",
      href: "/admin/users",
      icon: Users,
      requiredRole: "master",
    },
    {
      title: "Banco de dados",
      href: "/admin/database",
      icon: Database,
      requiredRole: "master",
    },
  ],
};

export function isMaster(role: string | null | undefined): boolean {
  return role === "admin" || role === "master";
}
