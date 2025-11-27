"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import {
  ReportFilters,
  useGetReport,
  useGetFeedbacksWithFilters,
} from "@/hooks/integration/feedback/queries";
import { useGetFeedbackOptions } from "@/hooks/integration/feedback-options/queries";
import { useState, useMemo } from "react";

export default function ReportsPage() {
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
  } = useGetReport(appliedFilters, shouldFetch);

  const { data: feedbacks = [], isLoading: feedbacksLoading } =
    useGetFeedbacksWithFilters(appliedFilters, shouldFetch);

  const loading = boxesLoading || reportLoading || feedbacksLoading;
  const error = reportError?.message || null;

  function loadReport() {
    // Remove campos vazios antes de buscar
    const cleanFilters: ReportFilters = {};
    if (localFilters.boxId) cleanFilters.boxId = localFilters.boxId;
    if (localFilters.category) cleanFilters.category = localFilters.category;
    if (localFilters.startDate) cleanFilters.startDate = localFilters.startDate;
    if (localFilters.endDate) cleanFilters.endDate = localFilters.endDate;

    setAppliedFilters(cleanFilters);
    setShouldFetch(true);
  }

  return (
    <div className="space-y-6">
      {/* --------------------  FILTROS  --------------------  */}
      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Box */}
          <select
            className="border p-2 rounded"
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
            type="date"
            className="border p-2 rounded"
            value={localFilters.startDate}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                startDate: e.target.value,
              })
            }
          />

          {/* Data Final */}
          <input
            type="date"
            className="border p-2 rounded"
            value={localFilters.endDate}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, endDate: e.target.value })
            }
          />

          {/* Categoria */}
          <select
            className="border p-2 rounded"
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
        <Card className="p-4 space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Total de feedbacks</div>
              <div className="text-2xl font-bold text-gray-800">
                {report.totalFeedbacks}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Categorias diferentes</div>
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(report.groupedByCategory).length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Dias com feedback</div>
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(report.groupedByDay).length}
              </div>
            </Card>
          </div>

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
      )}

      {/* --------------------  CARDS DE FEEDBACKS  --------------------  */}
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
                                : feedback.feedbackOption.type === "suggestion"
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
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

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
