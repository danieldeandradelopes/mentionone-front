import { getApiUrl } from "./api";
import { LoginResponse } from "./auth-actions";

export interface LoginCredentials {
  email: string;
  password: string;
  enterpriseId?: number;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Importante para receber cookies do refresh token
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Erro ao fazer login",
    }));
    throw new Error(errorData.message || "Erro ao fazer login");
  }

  const data = await response.json();
  return {
    token: data.token,
    user: data.user,
  };
}

export async function loginSuperAdmin(
  credentials: Omit<LoginCredentials, "enterpriseId">
): Promise<LoginResponse> {
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}/login/superadmin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Erro ao fazer login",
    }));
    throw new Error(errorData.message || "Erro ao fazer login");
  }

  const data = await response.json();
  return {
    token: data.token,
    user: data.user,
  };
}
