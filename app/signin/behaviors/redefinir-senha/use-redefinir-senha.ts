import { useActionState } from "react";
import { resetPasswordAction } from "./actions/redefinir-senha.action";

export type RedefinirState = {
  error: string | null;
  success: boolean;
};

export function useRedefinirSenha() {
  const [state, formAction, isLoading] = useActionState<
    RedefinirState,
    FormData
  >(resetPasswordAction, { error: null, success: false });

  return { state, formAction, isLoading };
}
