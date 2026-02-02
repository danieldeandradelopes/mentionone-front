import { useAuth } from "@/hooks/utils/use-auth";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { AUTH_KEYS } from "./keys";

export interface UserSessionUser {
  id: number;
  name: string;
  email: string;
  access_level: string;
  avatar?: string;
  phone?: string;
}

export interface UserSessionResponse {
  user: UserSessionUser;
  Enterprise?: { id: number; name: string; [key: string]: unknown } | null;
  phones?: unknown[] | null;
  onboarding_completed_at: string | null;
}

export interface UserSession {
  id: number;
  name: string;
  email: string;
  access_level: string;
  avatar: string;
  phone: string;
  enterprise?: { id: number; name: string };
}

export const useGetUserSession = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<UserSessionResponse, Error, UserSessionResponse>({
    queryKey: AUTH_KEYS.userSession(),
    queryFn: async () => {
      const response = await api.get<UserSessionResponse>({
        url: "/users/session",
      });
      return response;
    },
    retry: false,
    enabled: isAuthenticated(),
    refetchOnWindowFocus: true,
  });
};
