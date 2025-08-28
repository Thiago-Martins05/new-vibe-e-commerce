import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getUseShippingAddressesQueryKey } from "@/hooks/queries/use-shipping-addresses";

interface AddShippingAddressData {
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export const useAddShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddShippingAddressData) => {
      const response = await fetch("/api/shipping-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao adicionar endereço");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar a query dos endereços para refazer
      queryClient.invalidateQueries({
        queryKey: getUseShippingAddressesQueryKey,
      });
    },
  });
};

