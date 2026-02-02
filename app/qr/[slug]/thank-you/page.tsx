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

        {/* Marca MentionOne ou Copyright */}
        {branding.show_mentionone_branding ? (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">Powered by</p>
            <a
              href="https://mentionone.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700"
            >
              <Image
                src="/short-logo.png"
                alt="MentionOne"
                width={120}
                height={34}
                className="h-8 w-auto object-contain"
              />
              <span>MentionOne</span>
            </a>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">MentionOne © 2025</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ThankYou;
