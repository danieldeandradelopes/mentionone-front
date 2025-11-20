// app/admin/dashboard/page.tsx
import Feedback from "@/app/entities/Feedback";
import { getAllBoxes } from "@/app/lib/boxes";
import { getAllFeedbacks } from "@/lib/feedback";

export default async function DashboardPage() {
  const feedbacks = await getAllFeedbacks();
  const boxes = await getAllBoxes();

  // --- Métricas ---
  const total = feedbacks.length;

  const lastFeedback = feedbacks[0] ? new Date(feedbacks[0].createdAt) : null;

  const feedbacksByCategory = feedbacks.reduce(
    (acc: Record<string, number>, fb: Feedback) => {
      acc[fb.category] = (acc[fb.category] || 0) + 1;
      return acc;
    },
    {}
  );

  // Volume por dia (últimos 7 dias)
  const last7days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));

    const dayStr = date.toISOString().split("T")[0];

    const count = feedbacks.filter((fb) => {
      const fbDate = new Date(fb.createdAt).toISOString().split("T")[0];
      return fbDate === dayStr;
    }).length;

    return { date: dayStr, count };
  });

  return (
    <div className="space-y-10 pb-10">
      {/* HEADER */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total de Feedbacks" value={total} />
        <Card title="Total de Caixas" value={boxes.length} />
        <Card title="Feedbacks/dia (7 dias)" value={(total / 7).toFixed(1)} />
        <Card
          title="Último feedback"
          value={lastFeedback ? lastFeedback.toLocaleString("pt-BR") : "Nenhum"}
        />
      </div>

      {/* GRÁFICO POR CATEGORIA */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Feedbacks por Categoria</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(feedbacksByCategory).map((cat) => (
            <div
              key={cat}
              className="p-4 rounded-xl bg-white shadow text-center"
            >
              <p className="text-sm text-gray-500">{cat}</p>
              <p className="text-2xl font-bold">{feedbacksByCategory[cat]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GRÁFICO DE LINHA (texto por enquanto) */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Últimos 7 dias</h2>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="space-y-2">
            {last7days.map((day) => (
              <div key={day.date} className="flex items-center gap-4 text-sm">
                <span className="w-24 text-gray-500">{day.date}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-indigo-600 rounded"
                    style={{ width: `${day.count * 20}px` }}
                  ></div>
                </div>
                <span className="w-8 text-right font-semibold">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ÚLTIMOS FEEDBACKS */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Últimos feedbacks</h2>

        <div className="space-y-3">
          {feedbacks.slice(0, 5).map((fb) => (
            <div
              key={fb.id}
              className="p-4 bg-white shadow rounded-xl border border-gray-100"
            >
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                  {fb.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(fb.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>

              <p className="mt-2 text-gray-700">{fb.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow text-center border border-gray-100">
      <p className="text-xs uppercase text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
