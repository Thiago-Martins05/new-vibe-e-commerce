import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";

export const getUseOrdersQueryKey = ["orders"] as const;

export const useOrders = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: getUseOrdersQueryKey,
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Usuário não autenticado");
      }

      console.log("🔍 Buscando pedidos para usuário:", user.id);

      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para enviar cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar pedidos");
      }

      const data = await response.json();
      console.log("✅ Pedidos carregados:", data.length || 0);
      return data;
    },
    enabled: isAuthenticated && !!user, // Só executa se estiver autenticado
  });
};
