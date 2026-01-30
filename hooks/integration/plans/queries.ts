import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { PLAN_KEYS } from "./keys";
import { PlanResponse } from "@/@backend-types/Plan";

export const useGetPlans = () => {
  return useQuery<PlanResponse[], Error>({
    queryKey: PLAN_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<PlanResponse[]>({
        url: "/plans",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};
