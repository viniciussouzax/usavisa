"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { authErrorHandler } from "@/lib/auth/error";

type ActionResult = {
  error: string | null;
  success: boolean;
};

const schema = z
  .object({
    token: z.string().min(1, { message: "MISSING_TOKEN" }),
    password: z.string().min(8, { message: "WEAK_PASSWORD" }),
    confirm: z.string().min(1, { message: "MISSING_CONFIRM" }),
  })
  .refine((v) => v.password === v.confirm, {
    message: "PASSWORD_MISMATCH",
    path: ["confirm"],
  });

export async function resetPasswordAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message;
    if (code === "WEAK_PASSWORD") {
      return {
        error: "Senha muito fraca — use pelo menos 8 caracteres.",
        success: false,
      };
    }
    if (code === "PASSWORD_MISMATCH") {
      return { error: "As senhas não coincidem.", success: false };
    }
    if (code === "MISSING_TOKEN") {
      return { error: "Token ausente — abra o link do email.", success: false };
    }
    return { error: "Dados inválidos.", success: false };
  }

  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        token: parsed.data.token,
        newPassword: parsed.data.password,
      },
    });
  } catch (err) {
    const handled = authErrorHandler(err);
    return { error: handled.message, success: false };
  }

  return { error: null, success: true };
}
