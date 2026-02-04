"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGetFeedbacks } from "@/hooks/integration/feedback/queries";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import { useAuth } from "@/hooks/utils/use-auth";
import { usePlanFeatures } from "@/hooks/utils/use-plan-features";
import UpgradeBanner from "@/components/UpgradeBanner";
import Feedback from "@/@backend-types/Feedback";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: feedbacks, isLoading: loadingFeedbacks } = useGetFeedbacks();
  const { data: boxes = [], isLoading: loadingBoxes } = useGetBoxes();
  const { hasFeature, hasResponseLimit, getMaxResponsesPerMonth } =
    usePlanFeatures();

  // Verificar se feedbacks retornaram com paginação (limite atingido)
  const feedbacksData = useMemo(() => {
    return Array.isArray(feedbacks) ? feedbacks : feedbacks?.feedbacks || [];
  }, [feedbacks]);

  const pagination = useMemo(() => {
    return Array.isArray(feedbacks) ? null : feedbacks?.pagination;
  }, [feedbacks]);

  // Verifica autenticação no cliente
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const isLoading = loadingFeedbacks || loadingBoxes;

  // Ordena feedbacks por data (mais recente primeiro)
  const sortedFeedbacks = [...feedbacksData].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  // --- Métricas ---
  const total = pagination?.total || feedbacksData.length;

  const lastFeedback = sortedFeedbacks[0]?.created_at
    ? new Date(sortedFeedbacks[0].created_at)
    : null;

  const feedbacksByCategory = feedbacksData.reduce(
    (acc: Record<string, number>, fb: Feedback) => {
      acc[fb.category] = (acc[fb.category] || 0) + 1;
      return acc;
    },
    {},
  );

  // Volume por dia (últimos 7 dias) - formatado para gráfico
  const last7days = useMemo<
    Array<{ date: string; count: number; fullDate: string }>
  >(() => {
    // Prepare an object to count feedbacks per date (yyyy-mm-dd format)
    const feedbacksByDay: Record<string, number> = {};
    for (const fb of feedbacksData) {
      if (fb.created_at) {
        const fbDate = new Date(fb.created_at).toISOString().split("T")[0];
        feedbacksByDay[fbDate] = (feedbacksByDay[fbDate] || 0) + 1;
      }
    }

    // Generate last 7 days (oldest first)
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - i));

      const dayStr: string = date.toISOString().split("T")[0];
      const formattedDate: string = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });

      const count: number = feedbacksByDay[dayStr] || 0;

      return { date: formattedDate, count, fullDate: dayStr };
    });
  }, [feedbacksData]);

  // Dados para gráfico de pizza (categorias)
  const categoryChartData = useMemo(() => {
    return Object.entries(feedbacksByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [feedbacksByCategory]);

  // Verificar se pode acessar gráficos avançados
  const canAccessAdvancedCharts = hasFeature("can_access_advanced_charts");

  // Cores para os gráficos
  const COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
    "#ef4444", // red
    "#14b8a6", // teal
  ];

  if (isLoading) {
    return (
      <div className="space-y-10 pb-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-gray-500 text-center py-8">
          Carregando dados...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* HEADER */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Banner de upgrade se limite atingido */}
      {pagination?.limit_reached && hasResponseLimit() && (
        <UpgradeBanner
          message={`Você atingiu o limite de ${getMaxResponsesPerMonth()} respostas este mês. Faça upgrade para ver todas as respostas.`}
        />
      )}

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Total de Feedbacks"
          value={total}
          tooltip="Quantidade total de feedbacks recebidos"
        />
        <Card
          title="Total de Caixas"
          value={boxes.length}
          tooltip="Número de caixas de feedback configuradas"
        />
        <Card
          title="Feedbacks/dia (7 dias)"
          value={(total / 7).toFixed(1)}
          tooltip="Média diária dos últimos 7 dias"
        />
        <Card
          title="Último feedback"
          value={
            lastFeedback
              ? lastFeedback.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Nenhum"
          }
          tooltip="Data e hora do último feedback recebido"
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO DE LINHA - Últimos 7 dias (sempre visível) */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Feedbacks dos Últimos 7 Dias
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last7days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                name="Feedbacks"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* GRÁFICO DE PIZZA - Por Categoria (bloqueado no free) */}
        {canAccessAdvancedCharts ? (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Distribuição por Categoria
            </h2>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white rounded-xl shadow p-6 border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <p className="text-gray-500 mb-4">
                Gráficos avançados disponíveis em planos pagos
              </p>
              <UpgradeBanner
                message="Faça upgrade para acessar gráficos avançados e relatórios completos"
                ctaText="Ver planos"
              />
            </div>
          </section>
        )}
      </div>

      {/* GRÁFICO DE BARRAS - Por Categoria (bloqueado no free) */}
      {canAccessAdvancedCharts ? (
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Feedbacks por Categoria
          </h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6366f1" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </section>
      ) : null}

      {/* ÚLTIMOS FEEDBACKS */}
      <section aria-labelledby="ultimos-feedbacks-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2
            id="ultimos-feedbacks-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Últimos feedbacks
          </h2>
          {sortedFeedbacks.length > 0 && (
            <Link
              href="/admin/feedbacks"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
            >
              Ver todos
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {sortedFeedbacks.slice(0, 5).map((fb) => (
            <div
              key={fb.id}
              className="p-4 bg-white shadow rounded-xl border border-gray-100"
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                  {fb.category}
                </span>
                <span className="text-xs text-gray-500">
                  {fb.created_at
                    ? new Date(fb.created_at).toLocaleString("pt-BR")
                    : "Data não disponível"}
                </span>
              </div>

              <p className="mt-2 text-gray-700">{fb.text || "Sem texto"}</p>
            </div>
          ))}
          {sortedFeedbacks.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhum feedback encontrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  tooltip,
}: {
  title: string;
  value: string | number;
  tooltip?: string;
}) {
  return (
    <div
      className="p-4 bg-white rounded-xl shadow text-center border border-gray-100 min-w-0"
      title={tooltip}
    >
      <p className="text-xs uppercase text-gray-600">{title}</p>
      <p className="text-2xl font-semibold mt-1 text-gray-900">{value}</p>
    </div>
  );
}
