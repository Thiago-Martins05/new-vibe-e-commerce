import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/create-checkout-session";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    retry: false,
    onError: (error: Error) => {
      if (error.message.includes("Usuário não autenticado")) {
        toast.error("Faça login para continuar com a compra");
        return;
      }

      if (error.message.includes("Carrinho vazio")) {
        toast.error("Adicione produtos ao carrinho para continuar");
        return;
      }

      if (error.message.includes("Configuração de pagamento")) {
        toast.error(
          "Erro na configuração de pagamento. Entre em contato com o suporte.",
        );
        return;
      }

      if (error.message.includes("Stripe")) {
        toast.error("Erro no processamento do pagamento. Tente novamente.");
        return;
      }

      if (error.message.includes("autenticação")) {
        toast.error("Erro de autenticação. Faça login novamente.");
        return;
      }

      if (error.message.includes("carregar carrinho")) {
        toast.error("Erro ao carregar carrinho. Tente novamente.");
        return;
      }

      if (error.message.includes("endereço de entrega")) {
        toast.error("Erro ao atualizar endereço de entrega.");
        return;
      }

      toast.error("Erro ao finalizar compra. Tente novamente.");
    },
  });
};
