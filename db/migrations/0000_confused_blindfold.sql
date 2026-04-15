CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `assessor` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organizacao_uid` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organizacao_uid`) REFERENCES `organizacao`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_assessor_user_org` ON `assessor` (`user_id`,`organizacao_uid`);--> statement-breakpoint
CREATE INDEX `idx_assessor_org` ON `assessor` (`organizacao_uid`);--> statement-breakpoint
CREATE TABLE `global_integration` (
	`integration_id` text PRIMARY KEY NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`ativo` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `org_integration` (
	`id` text PRIMARY KEY NOT NULL,
	`organizacao_uid` text NOT NULL,
	`integration_id` text NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`ativo` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organizacao_uid`) REFERENCES `organizacao`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_org_integration_org_key` ON `org_integration` (`organizacao_uid`,`integration_id`);--> statement-breakpoint
CREATE TABLE `organizacao` (
	`uid` text PRIMARY KEY NOT NULL,
	`id` integer NOT NULL,
	`short_id` text NOT NULL,
	`nome` text NOT NULL,
	`whatsapp` text NOT NULL,
	`logo_light` text,
	`logo_dark` text,
	`icon_light` text,
	`icon_dark` text,
	`color_1` text DEFAULT '#09090b' NOT NULL,
	`color_2` text DEFAULT '#71717a' NOT NULL,
	`color_3` text DEFAULT '#3b82f6' NOT NULL,
	`font_title` text DEFAULT 'Inter' NOT NULL,
	`font_body` text DEFAULT 'Inter' NOT NULL,
	`ativa` integer DEFAULT true NOT NULL,
	`plano` text DEFAULT 'free' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizacao_id_unique` ON `organizacao` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizacao_short_id_unique` ON `organizacao` (`short_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_org_short_id` ON `organizacao` (`short_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`impersonated_by` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `share_link` (
	`token` text PRIMARY KEY NOT NULL,
	`solicitacao_uid` text NOT NULL,
	`created_by` text,
	`expires_at` integer,
	`revoked_at` integer,
	`access_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`solicitacao_uid`) REFERENCES `solicitacao`(`uid`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_share_link_solicitacao` ON `share_link` (`solicitacao_uid`);--> statement-breakpoint
CREATE TABLE `solicitacao` (
	`uid` text PRIMARY KEY NOT NULL,
	`id` integer NOT NULL,
	`organizacao_uid` text NOT NULL,
	`nome` text NOT NULL,
	`nota` text DEFAULT '' NOT NULL,
	`etapa` text DEFAULT 'Triagem' NOT NULL,
	`status` text DEFAULT 'Todo' NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`organizacao_uid`) REFERENCES `organizacao`(`uid`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_solicitacao_org_id` ON `solicitacao` (`organizacao_uid`,`id`);--> statement-breakpoint
CREATE INDEX `idx_solicitacao_org` ON `solicitacao` (`organizacao_uid`);--> statement-breakpoint
CREATE TABLE `solicitante` (
	`uid` text PRIMARY KEY NOT NULL,
	`solicitacao_uid` text NOT NULL,
	`ordem` integer NOT NULL,
	`nome` text NOT NULL,
	`parentesco` text NOT NULL,
	`cpf` text DEFAULT '' NOT NULL,
	`etapa` text DEFAULT 'Triagem' NOT NULL,
	`status` text DEFAULT 'Todo' NOT NULL,
	`dados_extras` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`solicitacao_uid`) REFERENCES `solicitacao`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_solicitante_solicitacao` ON `solicitante` (`solicitacao_uid`);--> statement-breakpoint
CREATE TABLE `solicitante_share_link` (
	`token` text PRIMARY KEY NOT NULL,
	`solicitante_uid` text NOT NULL,
	`created_by` text,
	`expires_at` integer,
	`revoked_at` integer,
	`access_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`solicitante_uid`) REFERENCES `solicitante`(`uid`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_solicitante_share_link_solicitante` ON `solicitante_share_link` (`solicitante_uid`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text,
	`banned` integer,
	`ban_reason` text,
	`ban_expires` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
