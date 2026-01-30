import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PAYMENT_KEYS } from "./keys";
import { PaymentResponse } from "@/@backend-types/Payment";

export interface CardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface HolderInput {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province?: string;
}

export interface CheckoutRequest {
  plan_price_id: number;
  card: CardInput;
  holder: HolderInput;
}

export interface CheckoutResponse {
  payment: PaymentResponse;
  gateway: {
    transactionId: string;
    status: "pending" | "paid";
  };
}

export const useCreateCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation<CheckoutResponse, Error, CheckoutRequest>({
    mutationFn: async (data) => {
      const response = await api.post<CheckoutResponse>({
        url: "/payments/checkout",
        data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.list() });
    },
    onError: (err) => {
      console.error("Erro ao iniciar pagamento:", err);
    },
    retry: false,
  });
};
