export function getApiUrl(): string {
  // Variável de ambiente para URL da API
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Desenvolvimento local - porta padrão da API
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3003";
  }

  // Produção padrão
  return "https://mentionone-api.vercel.app/";
}
