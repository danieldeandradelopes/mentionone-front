import { useAuth } from "@/hooks/utils/use-auth";
import { useSubscription } from "@/hooks/utils/use-subscription";
import { api } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_KEYS, LoginCredentials } from "./keys";
import Authentication from "@/@backend-types/Authentication";
import { defaultEnterprise } from "@/hooks/utils/use-auth";
import { SubscriptionValidateResponse } from "@/@backend-types/Subscription";

export const useLogin = () => {
  const { login } = useAuth();
  const { setSubscription } = useSubscription();

  return useMutation<Authentication, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      // O backend identifica automaticamente se é superadmin ou usuário normal
      const response = await api.post<Authentication>({
        url: "/login",
        data: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      // Salva a sessão usando o hook de auth (localStorage + cookies)
      await login(
        response.token,
        response.user,
        response.Enterprise || defaultEnterprise,
      );

      // Busca e salva a assinatura antes do redirect (evita flash bloqueado)
      try {
        const subscription = await api.get<SubscriptionValidateResponse>({
          url: "/subscription/validate-status",
        });
        setSubscription(subscription);
      } catch (error) {
        console.error("Erro ao validar assinatura no login:", error);
      }

      return response;
    },
    mutationKey: AUTH_KEYS.login({ email: "", password: "" }),
    onError: (err) => {
      console.error("Erro ao fazer login:", err);
    },
    retry: false,
  });
};

export const useLogout = () => {
  const { logout } = useAuth();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await logout();
    },
    mutationKey: AUTH_KEYS.logout(),
    retry: false,
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.put({ url: "/users/onboarding", data: {} });
    },
    mutationKey: ["auth", "completeOnboarding"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.userSession() });
    },
    retry: false,
  });
};
