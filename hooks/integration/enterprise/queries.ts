import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ENTERPRISE_KEYS } from "./keys";

export interface Enterprise {
  id: number;
  name: string;
  cover?: string | null;
  address?: string | null;
  description?: string | null;
  subdomain?: string | null;
  document?: string | null;
  document_type?: "cpf" | "cnpj" | null;
  email?: string | null;
  timezone: string;
  terms_accepted_at?: string | null;
  terms_accepted_ip?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useGetEnterpriseSettings = () => {
  return useQuery<Enterprise, Error>({
    queryKey: ENTERPRISE_KEYS.settings(),
    queryFn: async () => {
      const response = await api.get<Enterprise>({
        url: "/enterprise/settings",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};
