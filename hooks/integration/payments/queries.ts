import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { PAYMENT_KEYS } from "./keys";
import Payment from "@/@backend-types/Payment";

export const useGetPayments = () => {
  return useQuery<Payment[], Error>({
    queryKey: PAYMENT_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<Payment[]>({
        url: "/payments/history",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};
