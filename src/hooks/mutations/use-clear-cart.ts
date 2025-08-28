import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearCart } from "@/actions/clear-cart";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      // Invalidar a query do carrinho para atualizar a lista
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey,
      });
    },
  });
};
