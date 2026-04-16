import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Segmentos raiz que são rotas estáticas conhecidas (não organizações).
 * Qualquer URL cujo primeiro segmento esteja aqui NÃO é tratada como `/[shortId]`.
 */
const STATIC_ROOT_SEGMENTS = new Set([
  "auth",
  "api",
  "admin",
  "playground",
  "organizacoes",
  "integracoes",
  "signin",
  "styleguide",
  "_next",
  "public",
]);

/**
 * Segmentos auth-required dentro de uma organização.
 */
const ORG_AUTH_SUB_SEGMENTS = new Set([
  "solicitacoes",
  "execucoes",
  "faturamento",
  "integracoes",
  "organizacao",
  "configuracoes",
]);

type DomainKind = "visto" | "sends" | "unknown";
type PathOwner = "visto" | "sends" | "both";

/**
 * Classifica o host atual em um dos dois domínios suportados.
 * - `visto`  → vistoamericano.site / vistoamericano.local (solicitante, públicas)
 * - `sends`  → sends160.site / sends160.local (assessoria, dashboard)
 * - `unknown` → qualquer outro (localhost, previews Vercel, testes) — mantém
 *   comportamento single-app sem redirect cross-domain.
 */
function getDomainKind(host: string): DomainKind {
  if (host.includes("vistoamericano")) return "visto";
  if (host.includes("sends160")) return "sends";
  return "unknown";
}

/**
 * A qual domínio um path pertence. Paths em `both` podem ser servidos
 * em qualquer domínio (assets estáticos, /api/form-upload que aceita token).
 */
function pathOwner(pathname: string): PathOwner {
  // Assets e APIs compartilhadas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico"
  ) {
    return "both";
  }

  // /api/form-upload serve upload público via token — ambos domínios
  if (pathname.startsWith("/api/form-upload")) return "both";

  // /api/auth/* → só sends (onde o cookie de sessão é setado)
  if (pathname.startsWith("/api/auth")) return "sends";

  // Qualquer outro /api por padrão em ambos (defensivo)
  if (pathname.startsWith("/api/")) return "both";

  // Pages /auth/* (signup etc.) → sends
  if (pathname.startsWith("/auth")) return "sends";

  // Rotas Sends-only explícitas
  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organizacoes") ||
    pathname.startsWith("/integracoes") ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/styleguide")
  ) {
    return "sends";
  }

  // /[shortId]/...
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 1 && !STATIC_ROOT_SEGMENTS.has(segments[0])) {
    const sub = segments[1];

    // /[shortId]/signin, /[shortId]/signin/* → sends (login do assessor)
    if (sub === "signin") return "sends";

    // /[shortId]/<dashboard-segment> → sends
    if (sub && ORG_AUTH_SUB_SEGMENTS.has(sub)) return "sends";

    // /[shortId] ou /[shortId]/[token] ou /[shortId]/[token]/s/[uid] → visto
    return "visto";
  }

  return "both";
}

/**
 * Monta URL do domínio irmão preservando protocolo e porta.
 * Em dev (.local), usa http e mesma porta; em prod, https sem porta.
 */
function buildCrossDomainUrl(
  request: NextRequest,
  targetKind: "visto" | "sends",
): URL {
  const currentHost = request.headers.get("host") ?? "";
  const isDev = currentHost.includes(".local");
  const portMatch = currentHost.match(/:(\d+)$/);
  const port = portMatch ? portMatch[0] : "";

  const baseTarget =
    targetKind === "visto"
      ? isDev
        ? "vistoamericano.local"
        : "vistoamericano.site"
      : isDev
        ? "sends160.local"
        : "sends160.site";

  const protocol = isDev ? "http" : "https";
  const targetHost = isDev ? `${baseTarget}${port}` : baseTarget;

  return new URL(
    `${protocol}://${targetHost}${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
}

function isPublicPath(pathname: string): boolean {
  // Exclusões explícitas
  if (
    pathname === "/" ||
    pathname === "/signin" ||
    pathname.startsWith("/signin/") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico"
  ) {
    return true;
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || STATIC_ROOT_SEGMENTS.has(firstSegment)) return false;

  // /:shortId  — landing pública da organização
  if (segments.length === 1) return true;

  // /:shortId/:sub — protegido apenas se :sub é uma rota app conhecida
  if (segments.length >= 2 && !ORG_AUTH_SUB_SEGMENTS.has(segments[1])) {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const domainKind = getDomainKind(host);
  const owner = pathOwner(pathname);

  // Cross-domain redirect: só em produção/dev com hosts explícitos.
  // Em localhost ou previews Vercel (domainKind=unknown), mantém single-app.
  if (
    domainKind !== "unknown" &&
    owner !== "both" &&
    owner !== domainKind
  ) {
    return NextResponse.redirect(buildCrossDomainUrl(request, owner));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "sandbox-auth",
  });

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    // Se a URL está dentro de uma organização (/:shortId/...), redireciona
    // para o signin branded da org. Caso contrário, usa o signin genérico.
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];
    const isOrgScoped =
      !!firstSegment && !STATIC_ROOT_SEGMENTS.has(firstSegment);

    const signinPath = isOrgScoped
      ? `/${firstSegment}/signin`
      : "/signin";

    const redirectUrl = new URL(signinPath, request.url);
    redirectUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /auth (authentication pages)
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - /public (public files)
     *
     * `/` é incluído no matcher porque o middleware precisa decidir entre
     * servir a landing Sends160 (em sends160.site/) ou redirecionar (em
     * vistoamericano.site/) pro domínio irmão.
     */
    "/((?!auth|api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
