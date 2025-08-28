import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

interface RemoveCartItemData {
  itemId: string;
}

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RemoveCartItemData) => {
      console.log("🗑️ Removendo item do carrinho:", data);

      const response = await fetch(`/api/cart?itemId=${data.itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao remover produto");
      }

      const result = await response.json();
      console.log("✅ Item removido com sucesso:", result);

      // Salvar carrinho no localStorage para persistência
      if (result.cart) {
        localStorage.setItem("cart", JSON.stringify(result.cart));
        console.log("💾 Carrinho salvo no localStorage após remoção");
      }

      return result;
    },
    onSuccess: (data) => {
      console.log("🔄 Invalidando cache do carrinho após remoção...");
      console.log("🔄 Dados retornados:", data);

      // Invalidar e forçar refetch da query do carrinho
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey,
      });

      // Forçar refetch imediato
      queryClient.refetchQueries({
        queryKey: getUseCartQueryKey,
      });

      console.log("🔄 Cache invalidado e refetch forçado após remoção");

      // Buscar carrinho atualizado manualmente
      fetch("/api/cart", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((cart) => {
          console.log("🔄 Carrinho atualizado manualmente após remoção:", cart);
          // Atualizar cache com dados mais recentes
          queryClient.setQueryData(getUseCartQueryKey, cart);
        })
        .catch((error) => {
          console.error("❌ Erro ao buscar carrinho atualizado:", error);
        });
    },
    onError: (error) => {
      console.error("❌ Erro ao remover item:", error);
    },
  });
};
