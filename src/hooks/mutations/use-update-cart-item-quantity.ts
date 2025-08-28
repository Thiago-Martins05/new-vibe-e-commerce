import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

interface UpdateCartItemQuantityData {
  itemId: string;
  quantity: number;
}

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCartItemQuantityData) => {
      console.log("📝 Atualizando quantidade do item:", data);

      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar quantidade");
      }

      const result = await response.json();
      console.log("✅ Quantidade atualizada com sucesso:", result);

      // Salvar carrinho no localStorage para persistência
      if (result.cart) {
        localStorage.setItem("cart", JSON.stringify(result.cart));
        console.log("💾 Carrinho salvo no localStorage após atualização");
      }

      return result;
    },
    onSuccess: (data) => {
      console.log("🔄 Invalidando cache do carrinho após atualização...");
      console.log("🔄 Dados retornados:", data);

      // Invalidar e forçar refetch da query do carrinho
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey,
      });

      // Forçar refetch imediato
      queryClient.refetchQueries({
        queryKey: getUseCartQueryKey,
      });

      console.log("🔄 Cache invalidado e refetch forçado após atualização");

      // Buscar carrinho atualizado manualmente
      fetch("/api/cart", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((cart) => {
          console.log(
            "🔄 Carrinho atualizado manualmente após atualização:",
            cart,
          );
          // Atualizar cache com dados mais recentes
          queryClient.setQueryData(getUseCartQueryKey, cart);
        })
        .catch((error) => {
          console.error("❌ Erro ao buscar carrinho atualizado:", error);
        });
    },
    onError: (error) => {
      console.error("❌ Erro ao atualizar quantidade:", error);
    },
  });
};
