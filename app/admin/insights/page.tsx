"use client";

import { useGetInsightsLatest, useGetInsightsHistory } from "@/hooks/integration/insights/queries";
import { useGenerateInsights } from "@/hooks/integration/insights/mutations";
import { Sparkles, Loader2, History, FileText } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import notify from "@/utils/notify";
import type { AIAnalysisRun } from "@/src/@backend-types/Insights";
function formatDate(iso?: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const reportHeading =
  "mb-4 mt-6 text-xl font-bold text-zinc-900 border-b border-zinc-200 pb-2 first:mt-0";
const markdownComponents = {
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className={reportHeading} {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mb-3 mt-5 text-lg font-semibold text-zinc-900" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-zinc-800" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }: React.ComponentPropsWithoutRef<"h4">) => (
    <h4 className="mb-1.5 mt-3 text-sm font-semibold text-zinc-800" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="my-2 text-zinc-700 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-3 list-disc pl-6 space-y-1 text-zinc-700" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-3 list-decimal pl-6 space-y-1 text-zinc-700" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="leading-relaxed" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-zinc-900" {...props}>{children}</strong>
  ),
};

function ReportBlock({ run }: { run: AIAnalysisRun }) {
  const payload = run.payload as { report?: string; generatedAt?: string };
  const report = payload?.report ?? "";
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
        <FileText size={16} />
        Gerado em {formatDate(payload?.generatedAt ?? run.created_at)}
      </div>
      <div className="insights-report text-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {report}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { data: latest, isLoading: loadingLatest, error: errorLatest } = useGetInsightsLatest();
  const { data: history = [], isLoading: loadingHistory } = useGetInsightsHistory(20);
  const generateMutation = useGenerateInsights();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const viewingRun = viewingId ? history.find((r) => r.id === viewingId) : null;

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync();
      notify("Análise gerada com sucesso.", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar análise.";
      notify(msg, "error");
    }
  };

  if (loadingLatest && !latest && !errorLatest) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        <Loader2 size={24} className="animate-spin" aria-hidden />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Insights com IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Análise automática dos seus feedbacks com sugestões de melhoria.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generateMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Sparkles size={16} aria-hidden />
          )}
          Nova análise
        </button>
      </div>

      {errorLatest && !latest && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
          Nenhuma análise encontrada. Clique em &quot;Nova análise&quot; para gerar a primeira.
        </div>
      )}

      {latest && !viewingRun && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Última análise</h2>
          <ReportBlock run={latest} />
        </section>
      )}

      {viewingRun && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setViewingId(null)}
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Voltar à última análise
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Análise do histórico</h2>
          <ReportBlock run={viewingRun} />
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <History size={18} />
          Histórico
        </h2>
        {loadingHistory ? (
          <div className="flex items-center gap-2 py-4 text-zinc-500 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Carregando histórico...
          </div>
        ) : history.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">Nenhuma análise no histórico.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((run) => {
              const payload = run.payload as { generatedAt?: string };
              const isViewing = viewingId === run.id;
              return (
                <li key={run.id}>
                  <button
                    type="button"
                    onClick={() => setViewingId(isViewing ? null : run.id)}
                    className={`
                      w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition
                      ${isViewing ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}
                    `}
                  >
                    <span className="font-medium text-zinc-800">
                      Análise #{run.id}
                    </span>
                    <span className="text-zinc-500">
                      {formatDate(payload?.generatedAt ?? run.created_at)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
