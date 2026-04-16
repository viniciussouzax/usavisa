// ============================================================================
// Constantes de domínio — não vivem no banco, são enum-like
// ============================================================================

export const ETAPAS = [
  "Triagem",
  "Documentação",
  "Formulário DS-160",
  "Pagamento MRV",
  "Agendamento CASV",
  "Agendamento Consular",
  "Entrevista",
  "Aprovado",
  "Rejeitado",
] as const;
export type Etapa = (typeof ETAPAS)[number];

export const STATUSES = ["Todo", "Doing", "Done", "Retry"] as const;
export type Status = (typeof STATUSES)[number];

export const ALL_ETAPAS = "Todas as etapas" as const;

export const PLANOS = ["free", "premium"] as const;
export type Plano = (typeof PLANOS)[number];

export const PLANO_LABELS: Record<Plano, string> = {
  free: "Free",
  premium: "Premium",
};

// ============================================================================
// Tipos (alinhados com db/schema.ts)
// ============================================================================

export type Organizacao = {
  uid: string;
  id: number;
  shortId: string;
  nome: string;
  razaoSocial: string | null;
  cnpj: string | null;
  email: string | null;
  whatsapp: string;
  logoLight: string | null;
  logoDark: string | null;
  iconLight: string | null;
  iconDark: string | null;
  color1: string;
  color2: string;
  color3: string;
  fontTitle: string;
  fontBody: string;
  ativa: boolean;
  plano: Plano;
  tagline: string | null;
  descricao: string | null;
  footerText: string | null;
};

export type AssessorRole = "owner" | "admin" | "member";

export type Assessor = {
  id: string;
  nome: string;
  email: string;
  role: AssessorRole;
  organizacaoUid: string;
  ativo: boolean;
  criadoEm: string; // ISO date
};

export type Solicitacao = {
  id: string;               // user-facing (ex: "2050")
  uid: string;              // internal PK
  organizacaoId: string;    // org uid (FK)
  nome: string;
  nota: string;
  etapa: Etapa;
  status: Status;
  url: string;
};

export type Solicitante = {
  id: string;               // uid
  ordem: number;
  nome: string;
  parentesco: "Principal" | "Cônjuge" | "Filho(a)" | "Outro";
  cpf: string;
  etapa: Etapa;
  status: Status;
};

// ============================================================================
// Helpers (utils puros, não tocam DB)
// ============================================================================

export function buildWhatsAppUrl(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function sortSolicitantes(list: Solicitante[]): Solicitante[] {
  return [...list].sort((a, b) => {
    if (a.parentesco === "Principal" && b.parentesco !== "Principal") return -1;
    if (b.parentesco === "Principal" && a.parentesco !== "Principal") return 1;
    return a.ordem - b.ordem;
  });
}

export function etapaTone(etapa: Etapa) {
  if (etapa === "Triagem") return "warning" as const;
  if (etapa === "Aprovado") return "success" as const;
  if (etapa === "Rejeitado") return "danger" as const;
  return "info" as const;
}

export function statusTone(status: Status) {
  if (status === "Todo") return "neutral" as const;
  if (status === "Doing") return "info" as const;
  if (status === "Done") return "success" as const;
  if (status === "Retry") return "danger" as const;
  return "neutral" as const;
}

export function roleTone(role: AssessorRole) {
  if (role === "owner") return "success" as const;
  if (role === "admin") return "info" as const;
  return "neutral" as const;
}

export function roleLabel(role: AssessorRole) {
  if (role === "owner") return "Dono";
  if (role === "admin") return "Admin";
  return "Assessor";
}

// ============================================================================
// Integrações GLOBAIS (master-only) — catálogo estático da plataforma
// A tabela `global_integration` guarda só o config/ativo por id.
// ============================================================================

export type IntegracaoCategoria =
  | "Email"
  | "Captcha"
  | "Automação"
  | "Deploy"
  | "Código"
  | "Banco de dados"
  | "Domínio"
  | "WhatsApp";

export type IntegracaoFieldType = "text" | "password" | "email" | "url";

export type IntegracaoField = {
  key: string;
  label: string;
  type: IntegracaoFieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
};

export type Integracao = {
  id: string;
  nome: string;
  categoria: IntegracaoCategoria;
  descricao: string;
  conectado: boolean;
  /** Credenciais persistidas. Catalog declara o shape via `fields`. */
  config?: Record<string, string>;
  docsUrl?: string;
  fields: IntegracaoField[];
};

/**
 * Catálogo de integrações disponíveis. Cada uma declara seus fields.
 * O estado `conectado` virá do banco em runtime (via helper
 * `getGlobalIntegrations()` / `getOrgIntegrations()`).
 */
export const GLOBAL_INTEGRATION_CATALOG: Integracao[] = [
  {
    id: "resend",
    nome: "Resend",
    categoria: "Email",
    descricao: "Envio de emails transacionais",
    conectado: false,
    docsUrl: "https://resend.com/docs",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true, placeholder: "re_..." },
      { key: "fromEmail", label: "Email remetente", type: "email", required: true, placeholder: "noreply@sends160.site" },
      { key: "fromName", label: "Nome remetente", type: "text", placeholder: "Sends160" },
    ],
  },
  {
    id: "capmonster",
    nome: "CapMonster",
    categoria: "Captcha",
    descricao: "Resolução automática de CAPTCHAs do CASV/consulado",
    conectado: false,
    docsUrl: "https://docs.capmonster.cloud",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
    ],
  },
  {
    id: "apify",
    nome: "Apify",
    categoria: "Automação",
    descricao: "Automação web e scraping de formulários",
    conectado: false,
    docsUrl: "https://docs.apify.com",
    fields: [
      { key: "apiToken", label: "API Token", type: "password", required: true, placeholder: "apify_api_..." },
      { key: "actorId", label: "Actor ID padrão", type: "text", hint: "ID do actor de DS-160, opcional" },
    ],
  },
  {
    id: "vercel",
    nome: "Vercel",
    categoria: "Deploy",
    descricao: "Hospedagem e deploy contínuo da plataforma",
    conectado: false,
    docsUrl: "https://vercel.com/docs",
    fields: [
      { key: "token", label: "Token", type: "password", required: true },
      { key: "teamId", label: "Team ID", type: "text", placeholder: "team_..." },
      { key: "projectId", label: "Project ID", type: "text", placeholder: "prj_..." },
    ],
  },
  {
    id: "github",
    nome: "GitHub",
    categoria: "Código",
    descricao: "Repositório e pipelines de CI/CD",
    conectado: false,
    docsUrl: "https://docs.github.com",
    fields: [
      { key: "pat", label: "Personal Access Token", type: "password", required: true, placeholder: "ghp_..." },
      { key: "owner", label: "Organização / Usuário", type: "text", required: true },
      { key: "repo", label: "Repositório", type: "text", required: true },
    ],
  },
  {
    id: "turso",
    nome: "Turso",
    categoria: "Banco de dados",
    descricao: "Banco SQLite distribuído para produção",
    conectado: false,
    docsUrl: "https://docs.turso.tech",
    fields: [
      { key: "databaseUrl", label: "Database URL", type: "url", required: true, placeholder: "libsql://..." },
      { key: "authToken", label: "Auth Token", type: "password", required: true },
    ],
  },
  {
    id: "addy",
    nome: "Addy",
    categoria: "Domínio",
    descricao: "Encaminhamento de emails e aliases por organização",
    conectado: false,
    docsUrl: "https://addy.io/docs",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "domain", label: "Domínio", type: "text", required: true },
    ],
  },
];

/** Catálogo de integrações por-org (escopadas à organização). */
export const ORG_INTEGRATION_CATALOG: Integracao[] = [
  {
    id: "z-api",
    nome: "Z-API",
    categoria: "WhatsApp",
    descricao: "Envio e recebimento de mensagens via WhatsApp",
    conectado: false,
    docsUrl: "https://developer.z-api.io/",
    fields: [
      { key: "instanceId", label: "Instance ID", type: "text", required: true },
      { key: "token", label: "Token", type: "password", required: true },
      {
        key: "securityToken",
        label: "Client Token",
        type: "password",
        hint: "Necessário se sua instância exige autenticação dupla.",
      },
    ],
  },
];

export function getIntegracaoFromCatalog(id: string): Integracao | undefined {
  return (
    GLOBAL_INTEGRATION_CATALOG.find((i) => i.id === id) ??
    ORG_INTEGRATION_CATALOG.find((i) => i.id === id)
  );
}
