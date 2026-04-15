"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ActionResult = {
  error: string | null;
  sent: boolean;
};

const schema = z.object({
  email: z.string().email({ message: "INVALID_EMAIL" }),
  shortId: z
    .string()
    .regex(/^[a-z0-9-]{2,64}$/, { message: "INVALID_SHORTID" })
    .optional(),
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export async function requestPasswordResetAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    shortId: formData.get("shortId") || undefined,
  });

  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message;
    if (code === "INVALID_EMAIL") {
      return { error: "Email inválido.", sent: false };
    }
    return { error: "Dados inválidos.", sent: false };
  }

  const { email, shortId } = parsed.data;
  const redirectPath = shortId
    ? `/${shortId}/signin/redefinir`
    : "/signin/redefinir";
  const redirectTo = `${baseUrl}${redirectPath}`;

  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: { email, redirectTo },
    });
  } catch {
    // Não vazamos se o email existe ou não — mesma resposta sempre.
  }

  return { error: null, sent: true };
}
