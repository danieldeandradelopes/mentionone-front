"use client";
import { use } from "react";
import Image from "next/image";
import { useGetBoxBranding } from "@/hooks/integration/boxes/queries";

type TYProps = {
  params: Promise<{ slug: string }>;
};

export function ThankYou({ params }: TYProps) {
  const { slug } = use(params);
  const { data: branding, isLoading, isError } = useGetBoxBranding(slug);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="animate-pulse text-gray-400">
          Carregando identidade visual...
        </div>
      </main>
    );
  }

  if (isError || !branding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          Branding não encontrado!
        </h1>
        <p className="text-gray-600 text-center">
          Não foi possível encontrar a identidade visual para esta caixa.
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: branding.primary_color }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border">
        {branding.logo_url && (
          <Image
            src={branding.logo_url}
            alt={branding.client_name ?? ""}
            className="mx-auto mb-6 rounded-lg"
            style={{ objectFit: "contain" }}
            width={148}
            height={100}
            priority={true}
          />
        )}
        <h1 className="text-3xl font-bold mb-4">
          Obrigado{branding.client_name ? `, ${branding.client_name}` : ""}! 🎉
        </h1>
        <p className="text-gray-600 max-w-sm mb-6">
          Sua sugestão foi registrada com sucesso.
        </p>
        <a
          href={`/qr/${slug}`}
          className="underline"
          style={{ color: branding.secondary_color }}
        >
          Enviar outra sugestão
        </a>
      </div>
    </main>
  );
}

export default ThankYou;
