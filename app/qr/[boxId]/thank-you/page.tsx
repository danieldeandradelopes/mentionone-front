"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";

type TYProps = {
  params: Promise<{ boxId: string }>;
};

interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  clientName: string;
}

export function ThankYou({ params }: TYProps) {
  const { boxId } = use(params);
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    if (boxId) {
      fetch(`/qr/${boxId}/branding.json`)
        .then((res) => res.json())
        .then(setBranding)
        .catch(() => setBranding(null));
    }
  }, [boxId]);

  if (!branding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="animate-pulse text-gray-400">
          Carregando identidade visual...
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: branding.primaryColor }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border">
        {branding.logoUrl && (
          <Image
            src={branding.logoUrl}
            alt={branding.clientName}
            className="mx-auto mb-6 max-h-16"
            style={{ objectFit: "contain" }}
            width={300}
            height={64}
            priority={true}
          />
        )}
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: branding.primaryColor }}
        >
          Obrigado{branding.clientName && `, ${branding.clientName}`}! 🎉
        </h1>
        <p className="text-gray-600 max-w-sm mb-6">
          Sua sugestão foi registrada com sucesso.
        </p>
        <a
          href={`/qr/${boxId}`}
          className="underline"
          style={{ color: branding.secondaryColor }}
        >
          Enviar outra sugestão
        </a>
      </div>
    </main>
  );
}

export default ThankYou;
