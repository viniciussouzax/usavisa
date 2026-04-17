import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================================================
// Auth (Better Auth)
// ============================================================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
});

export type InsertUser = typeof user.$inferInsert;
export type SelectUser = typeof user.$inferSelect;

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  impersonatedBy: text("impersonated_by"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type InsertSession = typeof session.$inferInsert;
export type SelectSession = typeof session.$inferSelect;

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type InsertAccount = typeof account.$inferInsert;
export type SelectAccount = typeof account.$inferSelect;

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export type InsertVerification = typeof verification.$inferInsert;
export type SelectVerification = typeof verification.$inferSelect;

// ============================================================================
// Domínio: Organização
// ============================================================================

export const organizacao = sqliteTable(
  "organizacao",
  {
    uid: text("uid").primaryKey(),
    id: integer("id").notNull().unique(), // sequencial humano
    shortId: text("short_id").notNull().unique(),
    nome: text("nome").notNull(),
    razaoSocial: text("razao_social"),
    cnpj: text("cnpj"),
    email: text("email_org"),
    whatsapp: text("whatsapp").notNull(),

    // White label
    logoLight: text("logo_light"),
    logoDark: text("logo_dark"),
    iconLight: text("icon_light"),
    iconDark: text("icon_dark"),
    color1: text("color_1").notNull().default("#09090b"),
    color2: text("color_2").notNull().default("#71717a"),
    color3: text("color_3").notNull().default("#3b82f6"),
    logoMaxWidth: integer("logo_max_width").notNull().default(120),
    fontTitle: text("font_title").notNull().default("Inter"),
    fontBody: text("font_body").notNull().default("Inter"),

    ativa: integer("ativa", { mode: "boolean" }).notNull().default(true),
    plano: text("plano").notNull().default("free"), // "free" | "premium"

    automacaoConfig: text("automacao_config", { mode: "json" })
      .$type<{
        maxRetries?: number;
        cooldownRetry1Min?: number;
        cooldownRetry2Min?: number;
        timeoutPorRunMin?: number;
        custoMaxPorRunUsd?: number;
        retryAutoEmFalha?: boolean;
      }>()
      .notNull()
      .default({}),

    // Página pública (hotpage) — textos exibidos em /[shortId]
    tagline: text("tagline"),
    descricao: text("descricao"),
    footerText: text("footer_text"),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [uniqueIndex("idx_org_short_id").on(t.shortId)],
);

export type InsertOrganizacao = typeof organizacao.$inferInsert;
export type SelectOrganizacao = typeof organizacao.$inferSelect;

// ============================================================================
// Links da página pública da organização (Linktree-style)
// ============================================================================

export const orgPublicLink = sqliteTable(
  "org_public_link",
  {
    id: text("id").primaryKey(),
    organizacaoUid: text("organizacao_uid")
      .notNull()
      .references(() => organizacao.uid, { onDelete: "cascade" }),
    label: text("label").notNull(),
    descricao: text("descricao"),
    url: text("url").notNull(),
    icon: text("icon"), // emoji curto: "📅", "💬", "📄" etc.
    ordem: integer("ordem").notNull().default(0),
    ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_org_public_link_org").on(t.organizacaoUid)],
);

export type InsertOrgPublicLink = typeof orgPublicLink.$inferInsert;
export type SelectOrgPublicLink = typeof orgPublicLink.$inferSelect;

// ============================================================================
// Membership: user ↔ organizacao (com role)
// ============================================================================

export const assessor = sqliteTable(
  "assessor",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizacaoUid: text("organizacao_uid")
      .notNull()
      .references(() => organizacao.uid, { onDelete: "cascade" }),
    cpf: text("cpf"),
    role: text("role").notNull().default("member"), // "owner" | "admin" | "member"
    ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("idx_assessor_user_org").on(t.userId, t.organizacaoUid),
    index("idx_assessor_org").on(t.organizacaoUid),
  ],
);

export type InsertAssessor = typeof assessor.$inferInsert;
export type SelectAssessor = typeof assessor.$inferSelect;

// ============================================================================
// Solicitação (uma família/grupo por solicitação)
// ============================================================================

export const solicitacao = sqliteTable(
  "solicitacao",
  {
    uid: text("uid").primaryKey(),
    id: integer("id").notNull(), // sequencial por org (ex: #2050)
    organizacaoUid: text("organizacao_uid")
      .notNull()
      .references(() => organizacao.uid, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    nota: text("nota").notNull().default(""),
    etapa: text("etapa").notNull().default("Triagem"),
    status: text("status").notNull().default("Pendente"),
    url: text("url").notNull().default(""),

    createdBy: text("created_by").references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [
    uniqueIndex("idx_solicitacao_org_id").on(t.organizacaoUid, t.id),
    index("idx_solicitacao_org").on(t.organizacaoUid),
  ],
);

export type InsertSolicitacao = typeof solicitacao.$inferInsert;
export type SelectSolicitacao = typeof solicitacao.$inferSelect;

// ============================================================================
// Solicitante (membro de uma solicitação)
// ============================================================================

export const solicitante = sqliteTable(
  "solicitante",
  {
    uid: text("uid").primaryKey(),
    solicitacaoUid: text("solicitacao_uid")
      .notNull()
      .references(() => solicitacao.uid, { onDelete: "cascade" }),
    ordem: integer("ordem").notNull(),
    nome: text("nome").notNull(),
    parentesco: text("parentesco").notNull(), // "Principal" | "Cônjuge" | "Filho(a)" | "Outro"
    cpf: text("cpf").notNull().default(""),
    etapa: text("etapa").notNull().default("Triagem"),
    status: text("status").notNull().default("Pendente"),
    subEtapa: text("sub_etapa"),
    tarefaAtual: text("tarefa_atual"),
    dadosExtras: text("dados_extras", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_solicitante_solicitacao").on(t.solicitacaoUid)],
);

export type InsertSolicitante = typeof solicitante.$inferInsert;
export type SelectSolicitante = typeof solicitante.$inferSelect;

// ============================================================================
// Share Link (acesso público com token)
// ============================================================================

export const shareLink = sqliteTable(
  "share_link",
  {
    token: text("token").primaryKey(),
    solicitacaoUid: text("solicitacao_uid")
      .notNull()
      .references(() => solicitacao.uid, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    accessCount: integer("access_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_share_link_solicitacao").on(t.solicitacaoUid)],
);

export type InsertShareLink = typeof shareLink.$inferInsert;
export type SelectShareLink = typeof shareLink.$inferSelect;

// ============================================================================
// Solicitante Share Link — token individual por solicitante (form isolado)
// ============================================================================

export const solicitanteShareLink = sqliteTable(
  "solicitante_share_link",
  {
    token: text("token").primaryKey(),
    solicitanteUid: text("solicitante_uid")
      .notNull()
      .references(() => solicitante.uid, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => user.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    accessCount: integer("access_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_solicitante_share_link_solicitante").on(t.solicitanteUid),
  ],
);

export type InsertSolicitanteShareLink =
  typeof solicitanteShareLink.$inferInsert;
export type SelectSolicitanteShareLink =
  typeof solicitanteShareLink.$inferSelect;

// ============================================================================
// Form Data (DS-160 engine) — estado persistido do formulário por solicitante
// ============================================================================

export const formData = sqliteTable(
  "form_data",
  {
    solicitanteUid: text("solicitante_uid")
      .primaryKey()
      .references(() => solicitante.uid, { onDelete: "cascade" }),
    // { [secId.fieldId]: string | { day, month, year } | { p1, p2, p3 } }
    data: text("data", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    // { [secId.arrayId]: Array<Record<string, unknown>> }
    arrayData: text("array_data", { mode: "json" })
      .$type<Record<string, unknown[]>>()
      .notNull()
      .default({}),
    visitedSections: text("visited_sections", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    naFields: text("na_fields", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    unknownFields: text("unknown_fields", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
);

export type InsertFormData = typeof formData.$inferInsert;
export type SelectFormData = typeof formData.$inferSelect;

export const formLog = sqliteTable(
  "form_log",
  {
    id: text("id").primaryKey(),
    solicitanteUid: text("solicitante_uid")
      .notNull()
      .references(() => solicitante.uid, { onDelete: "cascade" }),
    // "section_complete" | "finalize" | "validation_error" | custom
    event: text("event").notNull(),
    payload: text("payload", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_form_log_solicitante").on(t.solicitanteUid)],
);

export type InsertFormLog = typeof formLog.$inferInsert;
export type SelectFormLog = typeof formLog.$inferSelect;

// ============================================================================
// Pipeline Log (stream unico por solicitante: form + automacao + manual)
// ============================================================================

export const pipelineLog = sqliteTable(
  "pipeline_log",
  {
    id: text("id").primaryKey(),
    solicitanteUid: text("solicitante_uid")
      .notNull()
      .references(() => solicitante.uid, { onDelete: "cascade" }),
    evento: text("evento").notNull(),
    subEtapa: text("sub_etapa"),
    tarefa: text("tarefa"),
    status: text("status"),
    dados: text("dados", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    duracaoMs: integer("duracao_ms"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_pipeline_log_solicitante").on(t.solicitanteUid)],
);

export type InsertPipelineLog = typeof pipelineLog.$inferInsert;
export type SelectPipelineLog = typeof pipelineLog.$inferSelect;

// ============================================================================
// Actor Run (rastreamento de cada execucao de actor no Apify)
// ============================================================================

export const actorRun = sqliteTable(
  "actor_run",
  {
    id: text("id").primaryKey(),
    solicitanteUid: text("solicitante_uid")
      .notNull()
      .references(() => solicitante.uid, { onDelete: "cascade" }),
    subEtapa: text("sub_etapa").notNull(),
    actorId: text("actor_id").notNull(),
    apifyRunId: text("apify_run_id"),
    tentativa: integer("tentativa").notNull().default(1),
    status: text("status").notNull().default("Pendente"),
    applicationId: text("application_id"),
    custoUsd: real("custo_usd"),
    duracaoMs: integer("duracao_ms"),
    agendadoPara: integer("agendado_para", { mode: "timestamp" }),
    erroTipo: text("erro_tipo"),
    erroMensagem: text("erro_mensagem"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("idx_actor_run_solicitante").on(t.solicitanteUid)],
);

export type InsertActorRun = typeof actorRun.$inferInsert;
export type SelectActorRun = typeof actorRun.$inferSelect;

// ============================================================================
// Integrações (configuração por org, identificador global)
// ============================================================================

export const orgIntegration = sqliteTable(
  "org_integration",
  {
    id: text("id").primaryKey(),
    organizacaoUid: text("organizacao_uid")
      .notNull()
      .references(() => organizacao.uid, { onDelete: "cascade" }),
    integrationId: text("integration_id").notNull(), // "z-api", "resend", etc.
    config: text("config", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    ativo: integer("ativo", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("idx_org_integration_org_key").on(
      t.organizacaoUid,
      t.integrationId,
    ),
  ],
);

export type InsertOrgIntegration = typeof orgIntegration.$inferInsert;
export type SelectOrgIntegration = typeof orgIntegration.$inferSelect;

// Integrações globais (só master). Mesma tabela com organizacao_uid = NULL
// seria problemático pelo unique index. Usamos tabela separada.
export const globalIntegration = sqliteTable("global_integration", {
  integrationId: text("integration_id").primaryKey(),
  config: text("config", { mode: "json" })
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  ativo: integer("ativo", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type InsertGlobalIntegration = typeof globalIntegration.$inferInsert;
export type SelectGlobalIntegration = typeof globalIntegration.$inferSelect;
