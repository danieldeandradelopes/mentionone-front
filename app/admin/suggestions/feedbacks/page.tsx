"use client";

import {
  FeedbackListResponse,
  useGetFeedbacks,
} from "@/hooks/integration/feedback/queries";
import { useUpdateFeedback } from "@/hooks/integration/feedback/mutations";
import { CheckCircle2, Clock, MessageSquare, QrCode } from "lucide-react";
import Link from "next/link";
import notify from "@/utils/notify";
import Feedback from "@/@backend-types/Feedback";

export default function SuggestionsFeedbacksPage() {
  const { data: feedbacks, isLoading, error } = useGetFeedbacks();
  const updateFeedbackMutation = useUpdateFeedback();
  const feedbackList = Array.isArray(feedbacks)
    ? feedbacks
    : ((feedbacks as FeedbackListResponse | undefined)?.feedbacks ?? []);
  const totalCount = Array.isArray(feedbacks)
    ? feedbacks.length
    : ((feedbacks as FeedbackListResponse | undefined)?.pagination?.total ??
      feedbackList.length);

  const handleToggleStatus = async (
    feedbackId: number,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "resolved" ? "pending" : "resolved";
    try {
      await updateFeedbackMutation.mutateAsync({
        id: feedbackId,
        data: { status: newStatus },
      });
      notify(
        `Feedback marcado como ${
          newStatus === "resolved" ? "concluído" : "pendente"
        }`,
        "success",
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      notify("Erro ao atualizar status do feedback", "error");
    }
  };

  if (isLoading) {
    return (
      <div
        className="text-gray-600 py-10"
        role="status"
        aria-label="Carregando feedbacks"
      >
        Carregando...
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="text-red-600 py-8 bg-red-50 rounded-xl border border-red-100 px-4"
        role="alert"
      >
        Erro ao carregar feedbacks. Tente novamente.
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">Feedbacks Recebidos</h1>
        <p className="text-gray-600 text-sm">Total: {totalCount} feedbacks</p>
      </header>

      <div className="space-y-4">
        {feedbackList.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white text-center"
            role="status"
            aria-label="Nenhum feedback encontrado"
          >
            <MessageSquare
              className="h-12 w-12 text-gray-400 mb-4"
              aria-hidden
            />
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Nenhum feedback ainda
            </h2>
            <p className="text-gray-600 text-sm mb-6 max-w-sm">
              Os feedbacks aparecem aqui quando alguém escanear o QR Code das
              suas caixas e enviar uma mensagem.
            </p>
            <Link
              href="/admin/suggestions/boxes"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <QrCode className="h-4 w-4" />
              Ver caixas e QR Codes
            </Link>
          </div>
        )}

        {feedbackList.map((fb: Feedback) => {
          const isResolved = fb.status === "resolved";
          return (
            <div
              key={fb.id}
              className="p-4 bg-white rounded-xl shadow border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                  {fb.category}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    fb.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : fb.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {fb.status === "pending"
                    ? "Pendente"
                    : fb.status === "resolved"
                      ? "Resolvido"
                      : fb.status}
                </span>
              </div>
              {fb.text ? (
                <p className="text-gray-700 whitespace-pre-wrap">{fb.text}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem texto</p>
              )}
              <div className="text-xs text-gray-400 mt-3 space-y-1">
                <p>ID: {fb.id}</p>
                <p>Box: {fb.box_id}</p>
                <p>{new Date(fb.created_at ?? "").toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
                {isResolved ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(fb.id, fb.status)}
                    disabled={updateFeedbackMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    aria-label="Marcar feedback como pendente"
                  >
                    <Clock size={14} aria-hidden />
                    Marcar como Pendente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(fb.id, fb.status)}
                    disabled={updateFeedbackMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    aria-label="Marcar feedback como concluído"
                  >
                    <CheckCircle2 size={14} aria-hidden />
                    Marcar como Concluído
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
