import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ENTERPRISE_KEYS } from "./keys";
import { Enterprise } from "./queries";

export const useUpdateEnterprise = () => {
  const queryClient = useQueryClient();

  return useMutation<Enterprise, Error, Partial<Enterprise>>({
    mutationFn: async (data) => {
      const response = await api.put<Enterprise>({
        url: "/enterprise/settings",
        data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTERPRISE_KEYS.settings() });
    },
    retry: false,
  });
};
