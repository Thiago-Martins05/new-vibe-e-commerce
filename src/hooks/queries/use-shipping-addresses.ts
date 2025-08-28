import { useQuery } from "@tanstack/react-query";

export const getUseShippingAddressesQueryKey = ["shipping-addresses"] as const;

export const useShippingAddresses = () => {
  return useQuery({
    queryKey: getUseShippingAddressesQueryKey,
    queryFn: async () => {
      const response = await fetch("/api/shipping-addresses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar endereços");
      }

      return response.json();
    },
  });
};
