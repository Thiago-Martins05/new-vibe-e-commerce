import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

interface AddCartItemData {
  productVariantId: string;
  quantity?: number;
}

export const useAddCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCartItemData) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao adicionar produto");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar e forçar refetch da query do carrinho
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey,
      });

      // Forçar refetch imediato
      queryClient.refetchQueries({
        queryKey: getUseCartQueryKey,
      });

      console.log("🔄 Cache invalidado e refetch forçado");

      // Buscar carrinho atualizado manualmente
      fetch("/api/cart", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((cart) => {
          console.log("🔄 Carrinho atualizado manualmente:", cart);
          // Atualizar cache com dados mais recentes
          queryClient.setQueryData(getUseCartQueryKey, cart);
        })
        .catch((error) => {
          console.error("❌ Erro ao buscar carrinho atualizado:", error);
        });
    },
  });
};
