"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Definição do tipo para branding
interface Branding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  clientName: string;
}

type Props = {
  params: Promise<{ boxId: string }>;
};

export default function QRFeedbackPage({ params }: Props) {
  const { boxId } = use(params);

  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<Branding | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (boxId) {
      fetch(`/qr/${boxId}/branding.json`)
        .then((res) => {
          console.log(res.json(), "res.json()");
          return res.json();
        })
        .then(setBranding)
        .catch(() => setBranding(null));
    }
  }, [boxId]);

  if (!boxId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          URL inválida! Parâmetro boxId não informado.
        </h1>
        <p className="text-gray-600 text-center">
          Por favor, acesse via link correto ou peça suporte.
        </p>
      </main>
    );
  }

  if (!branding) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="animate-pulse text-gray-400">
          Carregando identidade visual...
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log(boxId, text, category);

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boxId,
        text,
        category,
      }),
    });

    router.push(`/qr/${boxId}/thank-you`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-6"
      style={{ background: branding.primaryColor }}
    >
      <div className="w-full max-w-md mt-10 bg-white rounded-2xl shadow-lg p-5 border">
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
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: branding.primaryColor }}
        >
          {branding.clientName
            ? `Deixe sua sugestão para ${branding.clientName}`
            : "Deixe sua sugestão"}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Sua opinião é anônima e ajuda muito.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite sua sugestão..."
            className="p-3 border rounded-lg h-32 resize-none focus:ring-2"
            style={{
              borderColor: branding.secondaryColor,
              outlineColor: branding.secondaryColor,
            }}
          />

          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2"
            style={{
              borderColor: branding.secondaryColor,
              outlineColor: branding.secondaryColor,
            }}
          >
            <option value="">Selecione uma categoria (obrigatório)</option>
            <option value="servico">Serviço</option>
            <option value="limpeza">Limpeza</option>
            <option value="atendimento">Atendimento</option>
            <option value="infraestrutura">Infraestrutura</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="text-white p-3 rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ background: branding.secondaryColor }}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
