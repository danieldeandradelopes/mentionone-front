"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box } from "@/app/lib/boxes";
import Report from "@/app/entities/Report";

export default function ReportsPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [filters, setFilters] = useState({
    boxId: "",
    startDate: "",
    endDate: "",
    category: "",
  });

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoxes() {
      const res = await fetch("/api/boxes");
      setBoxes(await res.json());
    }
    loadBoxes();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v !== "")
      );

      const res = await fetch(`/api/reports/feedback?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Erro ao carregar relatório");
      }
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setReport(null);
    } finally {
      setLoading(false);
    }
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
            value={filters.boxId}
            onChange={(e) => setFilters({ ...filters, boxId: e.target.value })}
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
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          {/* Data Final */}
          <input
            type="date"
            className="border p-2 rounded"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />

          {/* Categoria */}
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Categoria"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          />
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
    </div>
  );
}
