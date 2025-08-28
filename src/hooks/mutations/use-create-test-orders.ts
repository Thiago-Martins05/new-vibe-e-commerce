import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTestOrders } from "@/actions/create-test-orders";
import { getUseOrdersQueryKey } from "@/hooks/queries/use-orders";

export const useCreateTestOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestOrders,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: getUseOrdersQueryKey,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar pedidos de teste");
    },
  });
};
