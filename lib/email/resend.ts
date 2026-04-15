import "server-only";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { globalIntegration } from "@/db/schema";

type ResendConfig = {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
};

/**
 * Lê as credenciais do Resend da integração global. Se não estiver configurada
 * ou ativa, lança erro explícito — a ideia é falhar alto, não mascarar.
 */
async function getResendConfig(): Promise<ResendConfig> {
  const [row] = await db
    .select()
    .from(globalIntegration)
    .where(eq(globalIntegration.integrationId, "resend"))
    .limit(1);

  if (!row || !row.ativo) {
    throw new Error(
      "Integração Resend não configurada. Configure em /integracoes.",
    );
  }

  const config = (row.config ?? {}) as Record<string, string>;
  const apiKey = config.apiKey?.trim();
  const fromEmail = config.fromEmail?.trim();

  if (!apiKey || !fromEmail) {
    throw new Error(
      "Credenciais Resend incompletas. Verifique apiKey e fromEmail em /integracoes.",
    );
  }

  return {
    apiKey,
    fromEmail,
    fromName: config.fromName?.trim() || undefined,
  };
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const cfg = await getResendConfig();
  const client = new Resend(cfg.apiKey);
  const from = cfg.fromName
    ? `${cfg.fromName} <${cfg.fromEmail}>`
    : cfg.fromEmail;

  const { error } = await client.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    throw new Error(`Falha ao enviar email: ${error.message}`);
  }
}

type SendPasswordResetInput = {
  to: string;
  userName?: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail(
  input: SendPasswordResetInput,
): Promise<void> {
  const greeting = input.userName ? `Olá, ${input.userName}` : "Olá";
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Redefinir senha</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        ${greeting},
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        Recebemos um pedido para redefinir a senha da sua conta. Clique no botão
        abaixo para escolher uma nova senha. Este link é válido por 1 hora.
      </p>
      <p style="margin: 24px 0;">
        <a href="${input.resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Redefinir senha
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #666;">
        Se você não pediu isso, pode ignorar este email — sua senha continuará a mesma.
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #999; margin-top: 24px;">
        Se o botão não funcionar, copie e cole este endereço no navegador:<br>
        <span style="word-break: break-all;">${input.resetUrl}</span>
      </p>
    </div>
  `;
  const text = `${greeting},\n\nRecebemos um pedido para redefinir sua senha. Abra este link para escolher uma nova senha (válido por 1 hora):\n\n${input.resetUrl}\n\nSe você não pediu isso, pode ignorar este email.`;

  await sendEmail({
    to: input.to,
    subject: "Redefinir senha",
    html,
    text,
  });
}
