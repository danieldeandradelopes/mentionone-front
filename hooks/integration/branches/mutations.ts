import { api } from "@/services/api";
import {
  Branch,
  BranchStoreData,
  BranchUpdateData,
} from "@/src/@backend-types/Branch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BRANCHES_KEYS } from "./keys";

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<Branch, Error, BranchStoreData>({
    mutationFn: async (data) => {
      const response = await api.post<Branch>({
        url: "/branches",
        data,
      });
      return response;
    },
    mutationKey: BRANCHES_KEYS.all(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao criar filial:", err);
    },
    retry: false,
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<Branch, Error, BranchUpdateData>({
    mutationFn: async (data) => {
      const { id, ...updateData } = data;
      const response = await api.put<Branch>({
        url: `/branches/${id}`,
        data: updateData,
      });
      return response;
    },
    mutationKey: BRANCHES_KEYS.all(),
    onSuccess: (data) => {
      queryClient.setQueryData(BRANCHES_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao atualizar filial:", err);
    },
    retry: false,
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete<void>({
        url: `/branches/${id}`,
      });
    },
    mutationKey: BRANCHES_KEYS.all(),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: BRANCHES_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: BRANCHES_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao excluir filial:", err);
    },
    retry: false,
  });
};
