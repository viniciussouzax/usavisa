"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authErrorHandler, throwAuthError } from "@/lib/auth/error";
import { resolveHomeUrl } from "@/lib/auth/home-url";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  try {
    const result = await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });
    signedUserId = result?.user?.id ?? null;
  } catch (err) {
    const handled = authErrorHandler(err);
    return { error: handled.message };
  }

  // signInEmail não retorna `role` (plugin admin). getUser() não serve aqui
  // porque o cookie foi setado na resposta, não está nos headers da request.
  // Busca direto do DB pra decidir o destino.
  let signedUserRole: string | null = null;
  if (signedUserId) {
    const [row] = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, signedUserId))
      .limit(1);
    signedUserRole = row?.role ?? null;
  }

  const fallback = signedUserId
    ? await resolveHomeUrl(signedUserId, signedUserRole)
    : "/";
  redirect(redirectURL || fallback);
}
