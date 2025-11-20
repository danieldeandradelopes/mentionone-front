// app/admin/feedbacks/page.tsx
import { getAllFeedbacks } from "@/lib/feedback";

export default async function FeedbackListPage() {
  const feedbacks = await getAllFeedbacks();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Feedbacks Recebidos</h1>
        <p className="text-gray-500 text-sm">
          Total: {feedbacks.length} feedbacks
        </p>
      </header>

      <div className="space-y-4">
        {feedbacks.length === 0 && (
          <p className="text-gray-500">Nenhum feedback encontrado.</p>
        )}

        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="p-4 bg-white rounded-xl shadow border border-gray-100"
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
              <p>Box: {fb.boxId}</p>
              <p>{new Date(fb.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
