import { api } from "@/services/api";
import Boxes, { BoxesStoreData, BoxesUpdateData } from "@/@backend-types/Boxes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BOXES_KEYS } from "./keys";

export const useCreateBox = (options?: { redirectOnSuccess?: boolean }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const redirectOnSuccess = options?.redirectOnSuccess !== false;

  return useMutation<Boxes, Error, BoxesStoreData>({
    mutationFn: async (data) => {
      const response = await api.post<Boxes>({
        url: "/boxes",
        data,
      });
      return response;
    },
    mutationKey: BOXES_KEYS.all(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOXES_KEYS.list() });
      if (redirectOnSuccess) router.push("/admin/boxes");
    },
    onError: (err) => {
      console.error("Erro ao criar box:", err);
    },
    retry: false,
  });
};

export const useUpdateBox = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<Boxes, Error, BoxesUpdateData>({
    mutationFn: async (data) => {
      const { id, ...updateData } = data;
      const response = await api.put<Boxes>({
        url: `/boxes/${id}`,
        data: updateData,
      });
      return response;
    },
    mutationKey: BOXES_KEYS.all(),
    onSuccess: (data) => {
      // Atualiza o cache com os dados atualizados
      queryClient.setQueryData(BOXES_KEYS.detail(data.id), data);
      // Invalida a lista para refetch
      queryClient.invalidateQueries({ queryKey: BOXES_KEYS.list() });
      // Redireciona para a lista
      router.push("/admin/boxes");
    },
    onError: (err) => {
      console.error("Erro ao atualizar box:", err);
    },
    retry: false,
  });
};

export const useDeleteBox = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete<void>({
        url: `/boxes/${id}`,
      });
    },
    mutationKey: BOXES_KEYS.all(),
    onSuccess: (_, id) => {
      // Remove do cache
      queryClient.removeQueries({ queryKey: BOXES_KEYS.detail(id) });
      // Invalida a lista para refetch
      queryClient.invalidateQueries({ queryKey: BOXES_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao deletar box:", err);
    },
    retry: false,
  });
};
