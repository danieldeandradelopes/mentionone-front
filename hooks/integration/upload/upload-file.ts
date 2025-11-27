import { useAuth } from "@/hooks/utils/use-auth";
import FileDataResponse from "@/types/FileType";
import { useMutation } from "@tanstack/react-query";
import { UPLOAD_KEYS } from "./keys";
import { getApiUrl } from "@/app/lib/api";

export const useUploadFile = () => {
  const { getToken } = useAuth();
  const API_BASE_URL = getApiUrl();

  return useMutation<FileDataResponse, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro no upload: ${response.status} - ${errorText}`);
        }

        const data: FileDataResponse = await response.json();
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message.includes("fetch")) {
          throw new Error(
            "Erro de conexão. Verifique sua internet e tente novamente."
          );
        }
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload cancelado por timeout. Tente novamente.");
        }
        throw error;
      }
    },
    mutationKey: [UPLOAD_KEYS.upload],
    retry: false,
  });
};
