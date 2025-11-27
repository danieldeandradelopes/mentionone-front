"use client";

import { useGetFeedbacks } from "@/hooks/integration/feedback/queries";
import { useUpdateFeedback } from "@/hooks/integration/feedback/mutations";
import { CheckCircle2, Clock } from "lucide-react";
import notify from "@/utils/notify";

export default function FeedbackListPage() {
  const { data: feedbacks, isLoading, error } = useGetFeedbacks();
  const updateFeedbackMutation = useUpdateFeedback();

  const handleToggleStatus = async (
    feedbackId: number,
    currentStatus: string
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
        "success"
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      notify("Erro ao atualizar status do feedback", "error");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }
  if (error) {
    return <div>Erro ao carregar feedbacks: {error.message}</div>;
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Feedbacks Recebidos</h1>
        <p className="text-gray-500 text-sm">
          Total: {feedbacks?.length} feedbacks
        </p>
      </header>

      <div className="space-y-4">
        {feedbacks?.length === 0 && (
          <p className="text-gray-500">Nenhum feedback encontrado.</p>
        )}

        {feedbacks?.map((fb) => {
          const isResolved = fb.status === "resolved";
          const isPending = fb.status === "pending";

          return (
            <div
              key={fb.id}
              className={`p-4 rounded-xl shadow border transition-colors ${
                isResolved
                  ? "bg-green-50 border-green-200"
                  : isPending
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full mb-2">
                {fb.category}
              </span>

              {/* Text */}
              {fb.text ? (
                <p className="text-gray-700 whitespace-pre-wrap">{fb.text}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem texto</p>
              )}

              {/* Metadata */}
              <div className="text-xs text-gray-400 mt-3 space-y-1">
                <p>ID: {fb.id}</p>
                <p>Box: {fb.box_id}</p>
                <p>{new Date(fb.created_at ?? "").toLocaleString("pt-BR")}</p>
              </div>

              {/* Botão de ação */}
              <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
                {isResolved ? (
                  <button
                    onClick={() => handleToggleStatus(fb.id, fb.status)}
                    disabled={updateFeedbackMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock size={14} />
                    Marcar como Pendente
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(fb.id, fb.status)}
                    disabled={updateFeedbackMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={14} />
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
