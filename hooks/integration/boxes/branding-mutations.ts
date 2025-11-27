import { api } from "@/services/api";
import BoxBranding from "@/@backend-types/BoxBranding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BOXES_KEYS } from "./keys";

export interface BoxBrandingData {
  box_id: number;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  client_name?: string;
}

export const useCreateBoxBranding = () => {
  const queryClient = useQueryClient();

  return useMutation<BoxBranding, Error, BoxBrandingData>({
    mutationFn: async (data) => {
      const response = await api.post<BoxBranding>({
        url: `/boxes/${data.box_id}/branding`,
        data: {
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          logo_url: data.logo_url,
          client_name: data.client_name,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: BOXES_KEYS.detailBySlug(""),
      });
      queryClient.invalidateQueries({
        queryKey: [...BOXES_KEYS.detail(data.box_id), "branding"],
      });
    },
    retry: false,
  });
};

// Hook para atualizar branding (usa o mesmo endpoint POST que cria ou atualiza)
export const useUpdateBoxBranding = () => {
  return useCreateBoxBranding();
};
