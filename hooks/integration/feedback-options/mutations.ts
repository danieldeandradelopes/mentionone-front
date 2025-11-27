import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEEDBACK_OPTIONS_KEYS } from "./keys";
import { FeedbackOption } from "./queries";

export interface FeedbackOptionData {
  name: string;
  type: "criticism" | "suggestion" | "praise";
  box_id?: number | null;
}

export const useCreateFeedbackOption = () => {
  const queryClient = useQueryClient();

  return useMutation<FeedbackOption, Error, FeedbackOptionData>({
    mutationFn: async (data) => {
      const response = await api.post<FeedbackOption>({
        url: "/feedback-options",
        data,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_OPTIONS_KEYS.list() });
      if (data.box_id) {
        queryClient.invalidateQueries({
          queryKey: FEEDBACK_OPTIONS_KEYS.byBox(data.box_id),
        });
      }
    },
    retry: false,
  });
};

export const useUpdateFeedbackOption = () => {
  const queryClient = useQueryClient();

  return useMutation<
    FeedbackOption,
    Error,
    { id: number; data: Partial<FeedbackOptionData> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<FeedbackOption>({
        url: `/feedback-options/${id}`,
        data,
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_OPTIONS_KEYS.list() });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_OPTIONS_KEYS.detail(data.id),
      });
      if (data.box_id) {
        queryClient.invalidateQueries({
          queryKey: FEEDBACK_OPTIONS_KEYS.byBox(data.box_id),
        });
      }
    },
    retry: false,
  });
};

export const useDeleteFeedbackOption = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete<void>({
        url: `/feedback-options/${id}`,
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_OPTIONS_KEYS.list() });
      queryClient.removeQueries({
        queryKey: FEEDBACK_OPTIONS_KEYS.detail(id),
      });
    },
    retry: false,
  });
};
