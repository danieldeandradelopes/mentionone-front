"use client";
import { useState } from "react";
import Feedback from "../entities/Feedback";

export default function FeedbackList({
  initialFeedbacks,
}: {
  initialFeedbacks: Feedback[];
}) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [loading, setLoading] = useState(false);

  async function updateList() {
    setLoading(true);
    const res = await fetch("/api/feedback", { cache: "no-store" });
    const data = await res.json();
    setFeedbacks(data);
    setLoading(false);
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          onClick={updateList}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow active:scale-95"
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:gap-4">
        {feedbacks.length === 0 && (
          <p className="text-gray-500 text-center mt-20">
            Nenhum feedback encontrado.
          </p>
        )}
        {feedbacks
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((f) => (
            <div
              key={f.id}
              className="bg-white shadow rounded-xl border border-gray-100 p-2 sm:p-4 overflow-x-auto"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  {f.category}
                </span>
              </div>
              {f.text && (
                <p className="text-gray-700 text-xs sm:text-sm mb-3 break-words">
                  {f.text}
                </p>
              )}
              <p className="text-gray-400 text-xs">
                {new Date(f.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
      </div>
    </>
  );
}
