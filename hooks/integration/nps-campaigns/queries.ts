import { api } from "@/services/api";
import type {
  NPSCampaign,
  NPSCampaignWithQuestions,
} from "@/src/@backend-types/NPSCampaign";
import type { NPSAnalyticsPayload } from "@/src/@backend-types/NPSAnalytics";
import { useQuery } from "@tanstack/react-query";
import { NPS_CAMPAIGNS_KEYS } from "./keys";

export const useGetNPSCampaigns = () => {
  return useQuery<NPSCampaign[], Error>({
    queryKey: NPS_CAMPAIGNS_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<NPSCampaign[]>({
        url: "/nps-campaigns",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetNPSCampaign = (id: number) => {
  return useQuery<NPSCampaignWithQuestions, Error>({
    queryKey: NPS_CAMPAIGNS_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get<NPSCampaignWithQuestions>({
        url: `/nps-campaigns/${id}`,
      });
      return response;
    },
    retry: false,
    enabled: !!id,
  });
};

export const useGetNPSAnalytics = () => {
  return useQuery<NPSAnalyticsPayload, Error>({
    queryKey: NPS_CAMPAIGNS_KEYS.analytics(),
    queryFn: async () => {
      const response = await api.get<NPSAnalyticsPayload>({
        url: "/nps-campaigns/analytics",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

/** Public: get campaign with questions by slug (for NPS form page). No auth. */
export const useGetNPSCampaignBySlugPublic = (slug: string) => {
  return useQuery<NPSCampaignWithQuestions, Error>({
    queryKey: NPS_CAMPAIGNS_KEYS.publicBySlug(slug),
    queryFn: async () => {
      const response = await api.get<NPSCampaignWithQuestions>({
        url: `/customers/nps/${slug}`,
      });
      return response;
    },
    retry: false,
    enabled: !!slug,
  });
};
