import { api } from "@/services/api";
import Feedback, {
  FeedbackStoreDataWithSlug,
} from "@/src/@backend-types/Feedback";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FEEDBACK_KEYS } from "./keys";

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<Feedback, Error, FeedbackStoreDataWithSlug>({
    mutationFn: async (data) => {
      const response = await api.post<Feedback>({
        url: "/feedbacks",
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
