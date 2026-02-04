import { api } from "@/services/api";
import type { AIAnalysisRun } from "@/src/@backend-types/Insights";
import { useQuery } from "@tanstack/react-query";
import { INSIGHTS_KEYS } from "./keys";

export const useGetInsightsLatest = () => {
  return useQuery<AIAnalysisRun, Error>({
    queryKey: INSIGHTS_KEYS.latest(),
    queryFn: async () => {
      const response = await api.get<AIAnalysisRun>({
        url: "/insights/ai",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetInsightsHistory = (limit?: number) => {
  return useQuery<AIAnalysisRun[], Error>({
    queryKey: INSIGHTS_KEYS.history(limit),
    queryFn: async () => {
      const queryParams =
        limit != null ? { limit: String(limit) } : undefined;
      const response = await api.get<AIAnalysisRun[]>({
        url: "/insights/history",
        ...(queryParams ? { queryParams } : {}),
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetInsightRun = (id: number | null) => {
  return useQuery<AIAnalysisRun, Error>({
    queryKey: INSIGHTS_KEYS.detail(id ?? 0),
    queryFn: async () => {
      const response = await api.get<AIAnalysisRun>({
        url: `/insights/${id}`,
      });
      return response;
    },
    retry: false,
    enabled: id != null && id > 0,
  });
};
