import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { FEEDBACK_OPTIONS_KEYS } from "./keys";

export interface FeedbackOption {
  id: number;
  enterprise_id: number;
  box_id: number | null;
  slug: string;
  name: string;
  type: "criticism" | "suggestion" | "praise";
  created_at?: string;
  updated_at?: string;
}

export const useGetFeedbackOptions = () => {
  return useQuery<FeedbackOption[], Error>({
    queryKey: FEEDBACK_OPTIONS_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<FeedbackOption[]>({
        url: "/feedback-options",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetFeedbackOptionsByBox = (boxId: number | null) => {
  return useQuery<FeedbackOption[], Error>({
    queryKey: FEEDBACK_OPTIONS_KEYS.byBox(boxId || 0),
    queryFn: async () => {
      if (!boxId) return [];
      const allOptions = await api.get<FeedbackOption[]>({
        url: "/feedback-options",
      });
      // Filtra apenas as opções desta box
      return allOptions.filter((option) => option.box_id === boxId);
    },
    retry: false,
    enabled: !!boxId,
  });
};

// Hook para buscar opções de feedback por slug da box (público)
export const useGetFeedbackOptionsByBoxSlug = (slug: string | null) => {
  return useQuery<FeedbackOption[], Error>({
    queryKey: [...FEEDBACK_OPTIONS_KEYS.all(), "box-slug", slug || ""],
    queryFn: async () => {
      if (!slug) return [];
      const response = await api.get<FeedbackOption[]>({
        url: `/customers/feedback-options/box/slug/${slug}`,
      });
      return response;
    },
    retry: false,
    enabled: !!slug,
  });
};
