import { useAuth } from "@/hooks/utils/use-auth";
import FileDataResponse from "@/types/FileType";
import { useMutation } from "@tanstack/react-query";
import { UPLOAD_KEYS } from "./keys";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export const useUpload = () => {
  const { getToken, register, getUser } = useAuth();

  return useMutation<FileDataResponse, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Criar um AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // Removendo Content-Type para permitir que o browser defina o boundary automaticamente
            // Isso é necessário para multipart/form-data funcionar corretamente
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro no upload: ${response.status} - ${errorText}`);
        }

        const data: FileDataResponse = await response.json();

        const user = getUser();
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        register({ ...user, avatar: data.path });

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
    onError: (err) => console.log(err),
    retry: false,
  });
};
