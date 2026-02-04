import { api } from "@/services/api";
import type {
  NPSCampaignWithQuestions,
  NPSCampaignStorePayload,
  NPSResponsePayload,
} from "@/src/@backend-types/NPSCampaign";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NPS_CAMPAIGNS_KEYS } from "./keys";

export const useCreateNPSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<
    NPSCampaignWithQuestions,
    Error,
    NPSCampaignStorePayload
  >({
    mutationFn: async (data) => {
      const response = await api.post<NPSCampaignWithQuestions>({
        url: "/nps-campaigns",
        data,
      });
      return response;
    },
    mutationKey: NPS_CAMPAIGNS_KEYS.all(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NPS_CAMPAIGNS_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao criar campanha NPS:", err);
    },
    retry: false,
  });
};

export const useUpdateNPSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<
    NPSCampaignWithQuestions,
    Error,
    { id: number; data: NPSCampaignStorePayload }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<NPSCampaignWithQuestions>({
        url: `/nps-campaigns/${id}`,
        data,
      });
      return response;
    },
    mutationKey: NPS_CAMPAIGNS_KEYS.all(),
    onSuccess: (data) => {
      queryClient.setQueryData(NPS_CAMPAIGNS_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: NPS_CAMPAIGNS_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao atualizar campanha NPS:", err);
    },
    retry: false,
  });
};

export const useDeleteNPSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete<void>({
        url: `/nps-campaigns/${id}`,
      });
    },
    mutationKey: NPS_CAMPAIGNS_KEYS.all(),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: NPS_CAMPAIGNS_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: NPS_CAMPAIGNS_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao excluir campanha NPS:", err);
    },
    retry: false,
  });
};

/** Public: submit NPS response (no auth). */
export const useSubmitNPSResponse = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation<{ id: number }, Error, NPSResponsePayload>({
    mutationFn: async (payload) => {
      const response = await api.post<{ id: number }>({
        url: `/customers/nps/${slug}/responses`,
        data: payload,
      });
      return response;
    },
    mutationKey: [...NPS_CAMPAIGNS_KEYS.publicBySlug(slug), "submit"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NPS_CAMPAIGNS_KEYS.publicBySlug(slug),
      });
    },
    retry: false,
  });
};
