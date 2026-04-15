import { useActionState } from "react";
import { requestPasswordResetAction } from "./actions/recuperar-senha.action";

export type RecuperarState = {
  error: string | null;
  sent: boolean;
};

export function useRecuperarSenha() {
  const [state, formAction, isLoading] = useActionState<
    RecuperarState,
    FormData
  >(requestPasswordResetAction, { error: null, sent: false });

  return { state, formAction, isLoading };
}
