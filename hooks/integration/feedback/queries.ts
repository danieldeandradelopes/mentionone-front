import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { FEEDBACK_KEYS } from "./keys";
import Feedback from "@/@backend-types/Feedback";

export interface FeedbackListResponse {
  feedbacks: Feedback[];
  pagination: {
    total: number;
    visible: number;
    limit_reached: boolean;
    current_month: string;
  };
}

export const useGetFeedbacks = () => {
  return useQuery<Feedback[] | FeedbackListResponse, Error>({
    queryKey: FEEDBACK_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<Feedback[] | FeedbackListResponse>({
        url: "/feedbacks",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetFeedback = (id: number) => {
  return useQuery<Feedback, Error>({
    queryKey: FEEDBACK_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get<Feedback>({
        url: `/feedbacks/${id}`,
      });
      return response;
    },
    retry: false,
    enabled: !!id,
  });
};

export const useGetFeedbacksByBox = (boxId: number) => {
  return useQuery<Feedback[], Error>({
    queryKey: FEEDBACK_KEYS.byBox(boxId),
    queryFn: async () => {
      const response = await api.get<Feedback[]>({
        url: `/feedbacks/box/${boxId}`,
      });
      return response;
    },
    retry: false,
    enabled: !!boxId,
  });
};

export interface ReportFilters {
  boxId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface Report {
  id: string;
  boxId: string | null;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  totalFeedbacks: number;
  groupedByCategory: Record<string, number>;
  groupedByDay: Record<string, number>;
}

export const useGetReport = (
  filters: ReportFilters,
  enabled: boolean = false
) => {
  return useQuery<Report, Error>({
    queryKey: FEEDBACK_KEYS.report(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.boxId) params.append("boxId", filters.boxId);
      if (filters.category) params.append("category", filters.category);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get<Report>({
        url: `/feedbacks/report?${params.toString()}`,
      });
      return response;
    },
    retry: false,
    enabled,
  });
};

export interface FeedbackWithDetails extends Feedback {
  box?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  feedbackOption?: {
    id: number;
    name: string;
    slug: string;
    type: "criticism" | "suggestion" | "praise";
  } | null;
}

export const useGetFeedbacksWithFilters = (
  filters: ReportFilters,
  enabled: boolean = false
) => {
  return useQuery<FeedbackWithDetails[], Error>({
    queryKey: [...FEEDBACK_KEYS.all(), "filtered", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.boxId) params.append("boxId", filters.boxId);
      if (filters.category) params.append("category", filters.category);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get<FeedbackWithDetails[]>({
        url: `/feedbacks/filtered?${params.toString()}`,
      });
      return response;
    },
    retry: false,
    enabled,
  });
};
