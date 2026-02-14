"use client";

import { useGetNPSAnalytics } from "@/hooks/integration/nps-campaigns/queries";
import { Card } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // promotores, neutros, detratores

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NPSAnalyticsPage() {
  const { data, isLoading, error } = useGetNPSAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 size={24} className="animate-spin" aria-hidden />
        <span className="ml-2">Carregando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
        Erro ao carregar métricas NPS. Tente novamente.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { overall, byCampaign, byBranch, recentResponses, byMonth } = data;

  if (overall.totalResponses === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Métricas NPS</h1>
        <p className="text-sm text-gray-500">
          Gráficos, notas e respostas recentes das suas pesquisas de satisfação.
        </p>
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            Nenhuma resposta NPS ainda. Crie campanhas e compartilhe o link para
            começar a coletar dados.
          </p>
        </Card>
      </div>
    );
  }

  const distributionData = [
    { name: "Promotores (9-10)", value: overall.promoters, color: COLORS[0] },
    { name: "Neutros (7-8)", value: overall.passives, color: COLORS[1] },
    { name: "Detratores (0-6)", value: overall.detractors, color: COLORS[2] },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Métricas NPS</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gráficos, notas e respostas recentes das suas pesquisas de satisfação.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total de respostas
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {overall.totalResponses}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Média NPS
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {overall.averageNps != null ? overall.averageNps.toFixed(1) : "-"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            NPS %
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {overall.npsPercentage != null
              ? `${overall.npsPercentage > 0 ? "+" : ""}${overall.npsPercentage}%`
              : "-"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Promotores / Neutros / Detratores
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {overall.promoters} / {overall.passives} / {overall.detractors}
          </p>
        </Card>
      </div>

      {/* Gráfico de distribuição */}
      {distributionData.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição NPS
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráfico por filial */}
      {byBranch.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            NPS por filial
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={byBranch.map((b) => ({
                name: b.name.length > 15 ? b.name.slice(0, 15) + "…" : b.name,
                fullName: b.name,
                média: b.averageNps ?? 0,
                "NPS %": b.npsPercentage ?? 0,
                respostas: b.withScore,
              }))}
              margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => value.toFixed(1)}
                labelFormatter={(_, payload) =>
                  payload[0]?.payload?.fullName ?? ""
                }
              />
              <Legend />
              <Bar dataKey="média" name="Média NPS" fill="#6366f1" />
              <Bar dataKey="NPS %" name="NPS %" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Gráfico por campanha */}
      {byCampaign.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            NPS por campanha
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={byCampaign.map((c) => ({
                name:
                  c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
                fullName: c.name,
                média: c.averageNps ?? 0,
                "NPS %": c.npsPercentage ?? 0,
                respostas: c.withScore,
              }))}
              margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => value.toFixed(1)}
                labelFormatter={(_, payload) =>
                  payload[0]?.payload?.fullName ?? ""
                }
              />
              <Legend />
              <Bar dataKey="média" name="Média NPS" fill="#6366f1" />
              <Bar dataKey="NPS %" name="NPS %" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Evolução no tempo */}
      {byMonth.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Respostas por mês
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={byMonth.map((m) => ({
                ...m,
                respostas: m.count,
                média: m.averageNps ?? 0,
              }))}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="respostas"
                name="Respostas"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="média"
                name="Média NPS"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tabela de respostas recentes */}
      <Card className="p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Respostas recentes
        </h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-medium">
              <th className="py-2 pr-4">Campanha</th>
              <th className="py-2 pr-4">Filial</th>
              <th className="py-2 pr-4">Nota NPS</th>
              <th className="py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {recentResponses.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-800">{r.campaignName}</td>
                <td className="py-2 pr-4 text-gray-600">
                  {r.branchName ?? "—"}
                </td>
                <td className="py-2 pr-4 font-medium">
                  {r.npsScore != null ? r.npsScore : "—"}
                </td>
                <td className="py-2 text-gray-600">
                  {formatDate(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
