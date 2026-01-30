import { api } from "@/services/api";
import { SubscriptionValidateResponse } from "@/@backend-types/Subscription";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/utils/use-auth";

export const SUBSCRIPTION_KEYS = {
  all: () => ["subscription"] as const,
  validate: () => [...SUBSCRIPTION_KEYS.all(), "validate"] as const,
};

export const useGetSubscription = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<SubscriptionValidateResponse, Error>({
    queryKey: SUBSCRIPTION_KEYS.validate(),
    queryFn: async () => {
      const response = await api.get<SubscriptionValidateResponse>({
        url: "/subscription/validate-status",
      });
      return response;
    },
    retry: false,
    enabled: isAuthenticated(),
    refetchOnWindowFocus: true,
  });
};

