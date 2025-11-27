import { api } from "@/services/api";
import Feedback, { FeedbackStoreDataWithSlug } from "@/@backend-types/Feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEEDBACK_KEYS } from "./keys";

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<Feedback, Error, FeedbackStoreDataWithSlug>({
    mutationFn: async (data) => {
      const response = await api.post<Feedback>({
        url: "/customers/feedbacks",
        data,
      });
      return response;
    },
    mutationKey: FEEDBACK_KEYS.all(),
    onSuccess: (data) => {
      // Invalida a lista de feedbacks
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.list() });
      // Invalida feedbacks da box específica
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_KEYS.byBox(data.box_id),
      });
    },
    onError: (err) => {
      console.error("Erro ao criar feedback:", err);
    },
    retry: false,
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Feedback,
    Error,
    {
      id: number;
      data: Partial<{ status: string; text: string; rating: number | null }>;
    }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<Feedback>({
        url: `/feedbacks/${id}`,
        data,
      });
      return response;
    },
    onSuccess: (data) => {
      // Invalida todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.all() });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_KEYS.detail(data.id),
      });
      if (data.box_id) {
        queryClient.invalidateQueries({
          queryKey: FEEDBACK_KEYS.byBox(data.box_id),
        });
      }
      // Invalida relatórios e feedbacks filtrados
      queryClient.invalidateQueries({ queryKey: FEEDBACK_KEYS.reports() });
      queryClient.invalidateQueries({
        queryKey: [...FEEDBACK_KEYS.all(), "filtered"],
      });
    },
    onError: (err) => {
      console.error("Erro ao atualizar feedback:", err);
    },
    retry: false,
  });
};
