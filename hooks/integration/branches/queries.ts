import { api } from "@/services/api";
import { Branch } from "@/src/@backend-types/Branch";
import { useQuery } from "@tanstack/react-query";
import { BRANCHES_KEYS } from "./keys";

export const useGetBranches = () => {
  return useQuery<Branch[], Error>({
    queryKey: BRANCHES_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<Branch[]>({
        url: "/branches",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetBranch = (id: number) => {
  return useQuery<Branch, Error>({
    queryKey: BRANCHES_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get<Branch>({
        url: `/branches/${id}`,
      });
      return response;
    },
    retry: false,
    enabled: !!id,
  });
};
