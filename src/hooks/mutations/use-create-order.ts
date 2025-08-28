import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createOrder } from "@/actions/create-order";
import { getUseOrdersQueryKey } from "@/hooks/queries/use-orders";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      toast.success(`Pedido #${data.orderNumber} criado com sucesso!`);
      queryClient.invalidateQueries({
        queryKey: getUseOrdersQueryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar pedido");
    },
  });
};
