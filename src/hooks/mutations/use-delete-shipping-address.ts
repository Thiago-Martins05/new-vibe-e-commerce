import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShippingAddress } from "@/actions/delete-shipping-address";
import { getUseShippingAddressesQueryKey } from "@/hooks/queries/use-shipping-addresses";

export const useDeleteShippingAddress = (addressId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      deleteShippingAddress({
        addressId,
      }),
    onSuccess: () => {
      // Invalidar a query dos endereços para atualizar a lista
      queryClient.invalidateQueries({
        queryKey: getUseShippingAddressesQueryKey,
      });
    },
  });
};
