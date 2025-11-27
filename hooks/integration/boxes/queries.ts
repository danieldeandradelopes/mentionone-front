import { api } from "@/services/api";
import BoxBranding from "@/@backend-types/BoxBranding";
import Boxes from "@/@backend-types/Boxes";
import { useQuery } from "@tanstack/react-query";
import { BOXES_KEYS } from "./keys";

export const useGetBoxes = () => {
  return useQuery<Boxes[], Error>({
    queryKey: BOXES_KEYS.list(),
    queryFn: async () => {
      const response = await api.get<Boxes[]>({
        url: "/boxes",
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useGetBox = (id: number) => {
  return useQuery<Boxes, Error>({
    queryKey: BOXES_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get<Boxes>({
        url: `/boxes/${id}`,
      });
      return response;
    },
    retry: false,
    enabled: !!id,
  });
};

// Hook para buscar box pelo slug
export const useGetBoxBySlug = (slug: string) => {
  return useQuery<Boxes, Error>({
    queryKey: BOXES_KEYS.detailBySlug(slug),
    queryFn: async () => {
      const response = await api.get<Boxes>({
        url: `/boxes/slug/${slug}`,
      });
      return response;
    },
    retry: false,
    enabled: !!slug,
  });
};

// Hook para buscar o branding de uma box pelo slug (rota pública)

export const useGetBoxBranding = (slug: string) => {
  return useQuery<BoxBranding | null, Error>({
    queryKey: BOXES_KEYS.detailBySlug(slug),
    queryFn: async () => {
      const response = await api.get<BoxBranding>({
        url: `/boxes/slug/${slug}/branding`,
      });
      return response;
    },
    retry: false,
    enabled: !!slug,
  });
};

// Hook para buscar branding por box ID (autenticado)
export const useGetBoxBrandingById = (boxId: number) => {
  return useQuery<BoxBranding | null, Error>({
    queryKey: [...BOXES_KEYS.detail(boxId), "branding"],
    queryFn: async () => {
      try {
        const response = await api.get<BoxBranding>({
          url: `/boxes/${boxId}/branding`,
        });
        return response;
      } catch (error) {
        // Se não encontrar branding (404), retorna null em vez de lançar erro
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        // Verifica se é um erro 404 ou se contém mensagem de "não encontrado"
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("Branding não encontrado") ||
          errorMessage.includes("Erro na requisição: 404")
        ) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    enabled: !!boxId,
  });
};
