import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SUBSCRIPTION_KEYS } from "./queries";

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      await api.post({
        url: "/subscriptions/cancel",
        data: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.validate() });
    },
    onError: (err) => {
      console.error("Erro ao cancelar assinatura:", err);
    },
    retry: false,
  });
};
