"use client";
import { useGetBoxBranding } from "@/hooks/integration/boxes/queries";
import { useCreateFeedback } from "@/hooks/integration/feedback/mutations";
import { useGetFeedbackOptionsByBoxSlug } from "@/hooks/integration/feedback-options/queries";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function QRFeedbackPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");

  // Busca o branding pelo slug do box
  const { data: branding, isLoading, isError, error } = useGetBoxBranding(slug);

  // Busca as opções de feedback desta box
  const { data: feedbackOptions = [], isLoading: optionsLoading } =
    useGetFeedbackOptionsByBoxSlug(slug);

  // Hook para criar feedback
  const createFeedbackMutation = useCreateFeedback();

  if (!slug) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center text-red-600">
          URL inválida! Parâmetro slug não informado.
        </h1>
        <p className="text-gray-600 text-center">
          Por favor, acesse via link correto ou peça suporte.
        </p>
      </main>
    );
  }

  if (isLoading || optionsLoading) {
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
          Erro ao carregar identidade visual
        </h1>
        <p className="text-gray-600 text-center">
          {error?.message || "A caixa não existe ou está sem branding."}
        </p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createFeedbackMutation.mutateAsync({
        box_slug: slug, // Envia o slug diretamente
        text,
        category,
        status: "pending",
      });
      router.push(`/qr/${slug}/thank-you`);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      // Você pode adicionar um toast ou mensagem de erro aqui
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-6"
      style={{ background: branding.primary_color }}
    >
      <div className="w-full max-w-md mt-10 bg-white rounded-2xl shadow-lg p-5 border">
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
        <h1 className="text-2xl font-bold mb-4 text-center">
          {branding.client_name
            ? `Deixe sua sugestão para ${branding.client_name}`
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
              outlineColor: branding.secondary_color,
            }}
          />

          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2"
            style={{
              outlineColor: branding.secondary_color,
            }}
          >
            <option value="">Selecione uma opção (obrigatório)</option>
            {feedbackOptions.length > 0 ? (
              feedbackOptions.map((option) => (
                <option key={option.id} value={option.slug}>
                  {option.name} (
                  {option.type === "criticism"
                    ? "Crítica"
                    : option.type === "suggestion"
                    ? "Sugestão"
                    : "Elogio"}
                  )
                </option>
              ))
            ) : (
              <>
                <option value="servico">Serviço</option>
                <option value="limpeza">Limpeza</option>
                <option value="atendimento">Atendimento</option>
                <option value="infraestrutura">Infraestrutura</option>
              </>
            )}
          </select>

          {createFeedbackMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {createFeedbackMutation.error?.message ||
                "Erro ao enviar feedback. Tente novamente."}
            </div>
          )}

          <button
            type="submit"
            disabled={createFeedbackMutation.isPending}
            className="text-white p-3 rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ background: branding.secondary_color }}
          >
            {createFeedbackMutation.isPending ? "Enviando..." : "Enviar"}
          </button>
        </form>

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
