import { api } from "@/services/api";
import BoxBranding from "@/src/@backend-types/BoxBranding";
import Boxes from "@/src/@backend-types/Boxes";
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

// Hook para buscar o branding de uma box pelo slug

export const useGetBoxBranding = (slug: string) => {
  return useQuery<BoxBranding | null, Error>({
    queryKey: BOXES_KEYS.detailBySlug(slug),
    queryFn: async () => {
      const response = await api.get<BoxBranding>({
        url: `/boxes/slug/${slug}`,
      });
      return response;
    },
    retry: false,
    enabled: !!slug,
  });
};
