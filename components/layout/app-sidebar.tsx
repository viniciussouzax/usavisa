"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  primaryNav,
  masterNav,
  isMaster,
  resolveNavHref,
  type NavItem,
  type NavResolveContext,
  type NavSection,
} from "./nav-config";
import { OrganizacaoLogo } from "./organizacao-logo";
import { ThemeToggle } from "./theme-toggle";
import type { Organizacao } from "@/app/data";

type AppSidebarProps = {
  userRole?: string | null;
  currentOrg?: Pick<Organizacao, "shortId" | "nome" | "logoLight" | "logoDark"> | null;
};

export function AppSidebar({ userRole, currentOrg }: AppSidebarProps) {
  const pathname = usePathname();
  const canSeeMaster = isMaster(userRole);
  const ctx: NavResolveContext = {
    currentOrgShortId: currentOrg?.shortId ?? null,
  };
  const homeHref = currentOrg ? `/${currentOrg.shortId}/solicitacoes` : "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href={homeHref} className="flex items-center gap-2 px-2 py-1.5">
          {currentOrg ? (
            <OrganizacaoLogo organizacao={currentOrg} size="sm" />
          ) : (
            <div className="flex h-8 items-center justify-center rounded-md bg-sidebar-primary px-3 text-xs font-semibold text-sidebar-primary-foreground">
              Master
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup
          section={primaryNav}
          pathname={pathname}
          ctx={ctx}
          isMasterUser={canSeeMaster}
        />
        {canSeeMaster && (
          <NavGroup
            // Sem contexto de org, os itens master viram o menu principal —
            // escondemos o label "Menu Master" para não parecer uma subseção
            // sem sentido.
            section={
              currentOrg ? masterNav : { ...masterNav, label: undefined }
            }
            pathname={pathname}
            ctx={ctx}
            isMasterUser={canSeeMaster}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavGroup({
  section,
  pathname,
  ctx,
  isMasterUser,
}: {
  section: NavSection;
  pathname: string;
  ctx: NavResolveContext;
  isMasterUser: boolean;
}) {
  return (
    <SidebarGroup>
      {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => {
            if (item.requiredRole === "master" && !isMasterUser) return null;
            const href = resolveNavHref(item.href, ctx);
            if (href === null) return null;
            return (
              <NavNode
                key={item.href}
                item={item}
                href={href}
                pathname={pathname}
                ctx={ctx}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavNode({
  item,
  href,
  pathname,
  ctx,
}: {
  item: NavItem;
  href: string;
  pathname: string;
  ctx: NavResolveContext;
}) {
  const Icon = item.icon;
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const hasChildren = Boolean(item.children?.length);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} render={<Link href={href} />}>
        <Icon className="h-4 w-4" />
        <span>{item.title}</span>
      </SidebarMenuButton>

      {hasChildren && (
        <SidebarMenuAction
          aria-label={expanded ? "Fechar submenu" : "Abrir submenu"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((x) => !x);
          }}
        >
          <ChevronDown
            className={cn(
              "transition-transform duration-200",
              expanded ? "rotate-0" : "-rotate-90",
            )}
          />
        </SidebarMenuAction>
      )}

      {hasChildren && (
        <SidebarMenuSub className={cn(!expanded && "hidden")}>
          {item.children!.map((child, idx) => {
            const childHref = resolveNavHref(child.href, ctx);
            if (childHref === null) return null;
            return (
              <SidebarMenuSubItem key={`${child.href}-${idx}`}>
                <SidebarMenuSubButton render={<Link href={childHref} />}>
                  {child.title}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
