"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authErrorHandler, throwAuthError } from "@/lib/auth/error";
import { resolveHomeUrl } from "@/lib/auth/home-url";

interface ActionResult {
  error: string | null;
}

const signInSchema = z.object({
  email: z.string().email({ message: "INVALID_EMAIL" }),
  password: z.string().min(6, { message: "WEAK_PASSWORD" }),
});

export async function signIn(
  _prevState: ActionResult,
  formData: FormData,
  redirectURL: string
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    const errorCode = firstError.message;

    if (errorCode === "INVALID_EMAIL") {
      return { error: throwAuthError("invalidEmail").message };
    }

    if (errorCode === "WEAK_PASSWORD") {
      return { error: throwAuthError("weakPassword").message };
    }

    return { error: "Validation error" };
  }

  const { email, password } = parsed.data;

  let signedUserId: string | null = null;
  let signedUserRole: string | null | undefined = null;
  try {
    const result = await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });
    signedUserId = result?.user?.id ?? null;
    // `role` vem da tabela user como coluna extra via plugin admin.
    signedUserRole = (result?.user as { role?: string | null } | undefined)?.role ?? null;
  } catch (err) {
    const handled = authErrorHandler(err);
    return { error: handled.message };
  }

  // Não dá pra usar getUser() aqui — o cookie de sessão foi setado na
  // resposta mas ainda não está nos headers da request atual.
  const fallback = signedUserId
    ? await resolveHomeUrl(signedUserId, signedUserRole)
    : "/";
  redirect(redirectURL || fallback);
}
