import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";

export const getUseCartQueryKey = ["cart"] as const;

export const useCart = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: getUseCartQueryKey,
    queryFn: async () => {
      console.log("🛒 useCart Hook - Estado:", {
        isAuthenticated,
        isLoading: false,
        userId: undefined,
        user,
      });

      if (!isAuthenticated) {
        throw new Error("Usuário não autenticado");
      }

      try {
        const response = await fetch("/api/cart", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar carrinho");
        }

        const cart = await response.json();
        console.log("✅ Carrinho carregado:", cart);

        // Salvar carrinho no localStorage como backup
        localStorage.setItem("cart", JSON.stringify(cart));

        return cart;
      } catch (error) {
        console.error("❌ Erro ao buscar carrinho da API:", error);

        // Tentar usar dados do localStorage como fallback
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            console.log(
              "🔄 Usando carrinho do localStorage como fallback:",
              parsedCart,
            );
            return parsedCart;
          } catch (parseError) {
            console.error(
              "❌ Erro ao parsear carrinho do localStorage:",
              parseError,
            );
          }
        }

        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};
