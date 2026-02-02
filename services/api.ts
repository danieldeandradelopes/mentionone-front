import { loadingManager } from "@/contexts/loading";
import { getUserTimeZoneForRequest } from "@/utils/date";
import { getApiUrl } from "@/app/lib/api";

const API_BASE_URL = getApiUrl();

// Função para obter o token do localStorage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      return parsedAuth.token || null;
    }
  } catch {
    return null;
  }

  return null;
}

// Rotas públicas que não precisam de token
const PUBLIC_ROUTES = [
  "/login",
  "/login/superadmin",
  "/refresh-token",
  "/boxes/slug/:slug/branding",
  "/boxes/slug/:slug",
  "/customers/feedbacks",
  "/feedback-options/slug/:slug",
  "/customers/feedback-options/box/slug/:slug",
];

function shouldAddAuthHeader(url: string): boolean {
  return !PUBLIC_ROUTES.some((route) => url.includes(route));
}

type HeaderType = {
  Authorization?: string;
};

type GetParams = {
  url: string;
  queryParams?: Record<string, string> | null | string[];
  headers?: HeaderType;
};

type PostParams = {
  url: string;
  data: unknown;
  headers?: HeaderType;
};

type PutParams = {
  url: string;
  data: unknown;
  headers?: HeaderType;
};

type PatchParams = {
  url: string;
  data?: unknown;
  headers?: HeaderType;
};

type DeleteParams = {
  url: string;
  headers?: HeaderType;
};

interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: number;
    access_level: string;
    enterprise_id: number;
  };
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": getUserTimeZoneForRequest(),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erro no refresh token: ${response.status}`);
      }

      const data: RefreshTokenResponse = await response.json();

      // Atualiza o token no localStorage
      if (typeof window !== "undefined") {
        try {
          const authData = localStorage.getItem("auth");
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            parsedAuth.token = data.accessToken;
            localStorage.setItem("auth", JSON.stringify(parsedAuth));
          }
        } catch {
          // Se não conseguir atualizar, continua mesmo assim
        }
      }

      return data.accessToken;
    } catch (error) {
      // Em caso de erro no refresh, redireciona para login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function makeRequestWithRetry<T>(
  requestFn: () => Promise<Response>,
  recreateRequestFn?: () => Promise<Response>
): Promise<T> {
  loadingManager.start();
  try {
    const response = await requestFn();

    if (response.status === 401) {
      // Não tenta refresh se for uma rota pública
      const url = response.url || "";
      if (PUBLIC_ROUTES.some((route) => url.includes(route))) {
        throw new Error("Unauthorized");
      }

      await refreshToken();

      // Usa recreateRequestFn se fornecido (para recriar com novo token), senão usa requestFn
      const retryFn = recreateRequestFn || requestFn;
      const retryResponse = await retryFn();

      if (!retryResponse.ok) {
        let errorMessage = `Erro na requisição: ${retryResponse.status}`;
        try {
          const errorData = await retryResponse.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Se não conseguir parsear JSON, usa a mensagem padrão
        }
        throw new Error(errorMessage);
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      let errorMessage = `Erro na requisição: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Se não conseguir parsear JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage);
    }

    // Se a resposta não tiver conteúdo, retorna void
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return undefined as T;
    }

    return response.json();
  } finally {
    loadingManager.stop();
  }
}

export const api = {
  async get<T>({ url, queryParams, headers }: GetParams): Promise<T> {
    const queryString = queryParams
      ? new URLSearchParams(queryParams as Record<string, string>).toString()
      : "";

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": getUserTimeZoneForRequest(),
      ...headers,
    };

    // Adiciona token de autenticação se necessário
    if (shouldAddAuthHeader(url)) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return makeRequestWithRetry<T>(
      () =>
        fetch(`${API_BASE_URL}${url}${queryString ? `?${queryString}` : ""}`, {
          method: "GET",
          headers: requestHeaders,
          credentials: "include",
        }),
      // Função para recriar a requisição após refresh token
      () => {
        const newHeaders = { ...requestHeaders };
        const newToken = getAuthToken();
        if (newToken && shouldAddAuthHeader(url)) {
          newHeaders.Authorization = `Bearer ${newToken}`;
        }
        return fetch(
          `${API_BASE_URL}${url}${queryString ? `?${queryString}` : ""}`,
          {
            method: "GET",
            headers: newHeaders,
            credentials: "include",
          }
        );
      }
    );
  },

  async post<T>({ url, data, headers }: PostParams): Promise<T> {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": getUserTimeZoneForRequest(),
      ...headers,
    };

    // Adiciona token de autenticação se necessário
    if (shouldAddAuthHeader(url)) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return makeRequestWithRetry<T>(
      () =>
        fetch(`${API_BASE_URL}${url}`, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        }),
      // Função para recriar a requisição após refresh token
      () => {
        const newHeaders = { ...requestHeaders };
        const newToken = getAuthToken();
        if (newToken && shouldAddAuthHeader(url)) {
          newHeaders.Authorization = `Bearer ${newToken}`;
        }
        return fetch(`${API_BASE_URL}${url}`, {
          method: "POST",
          headers: newHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        });
      }
    );
  },

  async put<T>({ url, data, headers }: PutParams): Promise<T> {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": getUserTimeZoneForRequest(),
      ...headers,
    };

    // Adiciona token de autenticação se necessário
    if (shouldAddAuthHeader(url)) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return makeRequestWithRetry<T>(
      () =>
        fetch(`${API_BASE_URL}${url}`, {
          method: "PUT",
          headers: requestHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        }),
      // Função para recriar a requisição após refresh token
      () => {
        const newHeaders = { ...requestHeaders };
        const newToken = getAuthToken();
        if (newToken && shouldAddAuthHeader(url)) {
          newHeaders.Authorization = `Bearer ${newToken}`;
        }
        return fetch(`${API_BASE_URL}${url}`, {
          method: "PUT",
          headers: newHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        });
      }
    );
  },

  async patch<T>({ url, data = {}, headers }: PatchParams): Promise<T> {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": getUserTimeZoneForRequest(),
      ...headers,
    };

    if (shouldAddAuthHeader(url)) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return makeRequestWithRetry<T>(
      () =>
        fetch(`${API_BASE_URL}${url}`, {
          method: "PATCH",
          headers: requestHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        }),
      () => {
        const newHeaders = { ...requestHeaders };
        const newToken = getAuthToken();
        if (newToken && shouldAddAuthHeader(url)) {
          newHeaders.Authorization = `Bearer ${newToken}`;
        }
        return fetch(`${API_BASE_URL}${url}`, {
          method: "PATCH",
          headers: newHeaders,
          body: JSON.stringify(data),
          credentials: "include",
        });
      }
    );
  },

  async delete<T>({ url, headers }: DeleteParams): Promise<T> {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-timezone": getUserTimeZoneForRequest(),
      ...headers,
    };

    // Adiciona token de autenticação se necessário
    if (shouldAddAuthHeader(url)) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    return makeRequestWithRetry<T>(
      () =>
        fetch(`${API_BASE_URL}${url}`, {
          method: "DELETE",
          headers: requestHeaders,
          credentials: "include",
        }),
      // Função para recriar a requisição após refresh token
      () => {
        const newHeaders = { ...requestHeaders };
        const newToken = getAuthToken();
        if (newToken && shouldAddAuthHeader(url)) {
          newHeaders.Authorization = `Bearer ${newToken}`;
        }
        return fetch(`${API_BASE_URL}${url}`, {
          method: "DELETE",
          headers: newHeaders,
          credentials: "include",
        });
      }
    );
  },
};
