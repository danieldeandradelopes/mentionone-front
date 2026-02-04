import { api } from "@/services/api";
import type { GenerateInsightsResponse } from "@/src/@backend-types/Insights";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INSIGHTS_KEYS } from "./keys";

export interface GenerateInsightsPayload {
  maxTokens?: number | null;
}

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GenerateInsightsResponse,
    Error,
    GenerateInsightsPayload | void
  >({
    mutationFn: async (payload) => {
      const response = await api.post<GenerateInsightsResponse>({
        url: "/insights/ai",
        data: payload ?? {},
      });
      return response;
    },
    mutationKey: INSIGHTS_KEYS.all(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSIGHTS_KEYS.all() });
    },
    onError: (err) => {
      console.error("Erro ao gerar insights:", err);
    },
    retry: false,
  });
};
