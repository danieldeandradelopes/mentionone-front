"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import {
  ReportFilters,
  useGetReport,
  useGetFeedbacksWithFilters,
} from "@/hooks/integration/feedback/queries";
import { useUpdateFeedback } from "@/hooks/integration/feedback/mutations";
import { useGetFeedbackOptions } from "@/hooks/integration/feedback-options/queries";
import { usePlanFeatures } from "@/hooks/utils/use-plan-features";
import UpgradeBanner from "@/components/UpgradeBanner";
import useMask from "@/hooks/utils/use-mask";
import { useState, useMemo } from "react";
import { CheckCircle2, Clock } from "lucide-react";
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

export default function ReportsPage() {
  const { hasFeature } = usePlanFeatures();
  const { formatDate } = useMask();
  const { data: boxes = [], isLoading: boxesLoading } = useGetBoxes();
  const { data: feedbackOptions = [] } = useGetFeedbackOptions();
  const [localFilters, setLocalFilters] = useState({
    boxId: "",
    startDate: "",
    endDate: "",
    category: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({});
  // Inicia como true para carregar automaticamente todos os feedbacks quando não há filtros
  const [shouldFetch, setShouldFetch] = useState(true);

  const inputClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const toIsoDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return "";
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    return `${year}-${month}-${day}`;
  };

  // Verificar se pode acessar reports
  const canAccessReports = hasFeature("can_access_reports");

  // Remove duplicatas de opções de feedback (mesmo slug) e ordena por nome
  const uniqueFeedbackOptions = useMemo(() => {
    const seen = new Set<string>();
    return feedbackOptions
      .filter((option) => {
        if (seen.has(option.slug)) {
          return false;
        }
        seen.add(option.slug);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [feedbackOptions]);

  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useGetReport(appliedFilters, shouldFetch && canAccessReports);

  const { data: feedbacks = [], isLoading: feedbacksLoading } =
    useGetFeedbacksWithFilters(appliedFilters, shouldFetch && canAccessReports);

  const updateFeedbackMutation = useUpdateFeedback();

  const loading = boxesLoading || reportLoading || feedbacksLoading;
  const error = reportError?.message || null;

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
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  // Dados para gráficos
  const chartData = useMemo(() => {
    if (!report) return null;

    // Dados para gráfico de pizza por categoria
    const categoryData = Object.entries(report.groupedByCategory).map(
      ([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        value,
        fullName: name,
      })
    );

    // Dados para gráfico de linha por dia (ordenado por data)
    const dayData = Object.entries(report.groupedByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        count,
        fullDate: date,
      }));

    // Dados para gráfico de barra por tipo (usando feedbacks detalhados)
    const typeData = feedbacks.reduce((acc, feedback) => {
      const type = feedback.feedbackOption?.type || "outro";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeChartData = [
      {
        name: "Crítica",
        value: typeData.criticism || 0,
        color: "#ef4444",
      },
      {
        name: "Sugestão",
        value: typeData.suggestion || 0,
        color: "#3b82f6",
      },
      {
        name: "Elogio",
        value: typeData.praise || 0,
        color: "#10b981",
      },
    ];

    // Dados para gráfico de status
    const statusData = feedbacks.reduce((acc, feedback) => {
      const status = feedback.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusChartData = [
      {
        name: "Pendente",
        value: statusData.pending || 0,
        color: "#f59e0b",
      },
      {
        name: "Resolvido",
        value: statusData.resolved || 0,
        color: "#10b981",
      },
      {
        name: "Outros",
        value: (statusData.unknown || 0) + (statusData.closed || 0),
        color: "#6b7280",
      },
    ];

    // Rating médio
    const ratings = feedbacks
      .filter((f) => f.rating != null)
      .map((f) => f.rating!);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return {
      categoryData,
      dayData,
      typeChartData,
      statusChartData,
      avgRating,
      totalWithRating: ratings.length,
    };
  }, [report, feedbacks]);

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  function loadReport() {
    // Remove campos vazios antes de buscar
    const cleanFilters: ReportFilters = {};
    if (localFilters.boxId) cleanFilters.boxId = localFilters.boxId;
    if (localFilters.category) cleanFilters.category = localFilters.category;
    const startDateIso = toIsoDate(localFilters.startDate);
    const endDateIso = toIsoDate(localFilters.endDate);
    if (startDateIso) cleanFilters.startDate = startDateIso;
    if (endDateIso) cleanFilters.endDate = endDateIso;

    setAppliedFilters(cleanFilters);
    setShouldFetch(true);
  }

  // Se não pode acessar, mostrar mensagem de bloqueio
  if (!canAccessReports) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Funcionalidade não disponível no seu plano
          </h2>
          <p className="text-gray-600 mb-6">
            A página de relatórios completa está disponível apenas em planos
            pagos.
          </p>
          <UpgradeBanner
            message="Faça upgrade para acessar relatórios completos com gráficos avançados e exportação de dados"
            ctaText="Ver planos"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --------------------  FILTROS  --------------------  */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Box */}
          <select
            className={inputClassName}
            value={localFilters.boxId}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, boxId: e.target.value })
            }
          >
            <option value="">Todas as caixas</option>
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Data Inicial */}
          <input
            type="text"
            className={inputClassName}
            value={localFilters.startDate}
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                startDate: formatDate(e.target.value),
              })
            }
          />

          {/* Data Final */}
          <input
            type="text"
            className={inputClassName}
            value={localFilters.endDate}
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            maxLength={10}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                endDate: formatDate(e.target.value),
              })
            }
          />

          {/* Categoria */}
          <select
            className={inputClassName}
            value={localFilters.category}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, category: e.target.value })
            }
          >
            <option value="">Todas as categorias</option>
            {uniqueFeedbackOptions.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.name} (
                {option.type === "criticism"
                  ? "Crítica"
                  : option.type === "suggestion"
                  ? "Sugestão"
                  : "Elogio"}
                )
              </option>
            ))}
          </select>
        </div>

        <Button onClick={loadReport} disabled={loading}>
          {loading ? "Carregando..." : "Aplicar filtros"}
        </Button>
      </Card>

      {/* --------------------  ERRO  --------------------  */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* --------------------  RESULTADOS  --------------------  */}
      {report && (
        <div className="space-y-6">
          {/* KPIs */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Total de feedbacks
                </div>
                <div className="text-3xl font-bold text-blue-800 mt-1">
                  {report.totalFeedbacks}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium">
                  Categorias diferentes
                </div>
                <div className="text-3xl font-bold text-green-800 mt-1">
                  {Object.keys(report.groupedByCategory).length}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">
                  Dias com feedback
                </div>
                <div className="text-3xl font-bold text-purple-800 mt-1">
                  {Object.keys(report.groupedByDay).length}
                </div>
              </div>
              {chartData && chartData.totalWithRating > 0 && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">
                    Rating médio
                  </div>
                  <div className="text-3xl font-bold text-yellow-800 mt-1">
                    {chartData.avgRating.toFixed(1)}
                    <span className="text-lg text-yellow-600">/5</span>
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">
                    {chartData.totalWithRating} avaliações
                  </div>
                </div>
              )}
            </div>
          </Card>

          {(shouldFetch || Object.keys(appliedFilters).length === 0) &&
            feedbacks.length > 0 && (
              <Card className="p-4 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Feedbacks ({feedbacks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {feedbacks.map((feedback) => (
                    <Card
                      key={feedback.id}
                      className="p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        {/* Header com Box e Tipo */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {feedback.box && (
                              <div className="text-sm font-medium text-gray-700">
                                {feedback.box.name}
                              </div>
                            )}
                            {feedback.feedbackOption && (
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    feedback.feedbackOption.type === "criticism"
                                      ? "bg-red-100 text-red-700"
                                      : feedback.feedbackOption.type ===
                                        "suggestion"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {feedback.feedbackOption.type === "criticism"
                                    ? "Crítica"
                                    : feedback.feedbackOption.type ===
                                      "suggestion"
                                    ? "Sugestão"
                                    : "Elogio"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {feedback.feedbackOption.name}
                                </span>
                              </div>
                            )}
                            {!feedback.feedbackOption && feedback.category && (
                              <div className="text-xs text-gray-500 mt-1">
                                {feedback.category}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              feedback.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : feedback.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {feedback.status === "pending"
                              ? "Pendente"
                              : feedback.status === "resolved"
                              ? "Resolvido"
                              : feedback.status}
                          </span>
                        </div>

                        {/* Texto do Feedback */}
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {feedback.text}
                        </p>

                        {/* Data */}
                        {feedback.created_at && (
                          <div className="text-xs text-gray-500">
                            {new Date(feedback.created_at).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        )}

                        {/* Rating */}
                        {feedback.rating && (
                          <div className="text-sm text-gray-600">
                            ⭐ {feedback.rating}/5
                          </div>
                        )}

                        {/* Botões de ação */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          {feedback.status === "resolved" ? (
                            <button
                              onClick={() =>
                                handleToggleStatus(feedback.id, feedback.status)
                              }
                              disabled={updateFeedbackMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Clock size={14} />
                              Marcar como Pendente
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleStatus(feedback.id, feedback.status)
                              }
                              disabled={updateFeedbackMutation.isPending}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 size={14} />
                              Marcar como Concluído
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

          {/* GRÁFICOS */}
          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de linha - Feedbacks ao longo do tempo */}
              {chartData.dayData.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Feedbacks ao Longo do Tempo
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.dayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Feedbacks"
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de pizza - Por categoria */}
              {chartData.categoryData.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Distribuição por Categoria
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${
                            percent ? (percent * 100).toFixed(0) : 0
                          }%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de barra - Por tipo */}
              {chartData.typeChartData.some((d) => d.value > 0) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Distribuição por Tipo
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Quantidade">
                        {chartData.typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de barra - Por status */}
              {chartData.statusChartData.some((d) => d.value > 0) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Distribuição por Status
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Quantidade">
                        {chartData.statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {/* TABELAS E DETALHES */}
          <Card className="p-4 space-y-4">
            {/* Agrupamento por Categoria */}
            {Object.keys(report.groupedByCategory).length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Por Categoria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(report.groupedByCategory).map(
                    ([category, count]) => (
                      <Card key={category} className="p-3">
                        <div className="text-sm text-gray-500">{category}</div>
                        <div className="text-xl font-bold text-gray-800">
                          {count}
                        </div>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Agrupamento por Dia */}
            {Object.keys(report.groupedByDay).length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Por Dia
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="p-2 text-gray-700">Data</th>
                      <th className="p-2 text-gray-700">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(report.groupedByDay)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, count]) => (
                        <tr key={date} className="border-b border-gray-200">
                          <td className="p-2 text-gray-800">
                            {new Date(date).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="p-2 text-gray-800">{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {report.totalFeedbacks === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum feedback encontrado com os filtros aplicados.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* --------------------  CARDS DE FEEDBACKS  --------------------  */}

      {(shouldFetch || Object.keys(appliedFilters).length === 0) &&
        feedbacks.length === 0 &&
        report &&
        report.totalFeedbacks === 0 && (
          <Card className="p-4">
            <div className="text-center py-8 text-gray-500">
              Nenhum feedback encontrado com os filtros aplicados.
            </div>
          </Card>
        )}
    </div>
  );
}
