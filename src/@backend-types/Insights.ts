/** Parte 1: por unidade — para gráfico de barras e contexto */
export interface InsightsPart1Unit {
  unitName: string;
  totalResponses: number;
  averageNps: number;
  promoters: number;
  passives: number;
  detractors: number;
  detractorsPercent?: number;
  situationLabel?: string;
  situationReason?: string;
  mainFeedback?: string;
}

/** Parte 2: comparação entre unidades */
export interface InsightsPart2Comparison {
  ranking: Array<{ unitName: string; averageNps: number; totalResponses?: number }>;
  differenceSummary?: string;
  explanation?: string;
}

/** Parte 3: resumo e indicadores */
export interface InsightsPart3Summary {
  trend?: "Melhorando" | "Estável" | "Piorando";
  trendJustification?: string;
  revenueRisk?: {
    detractorsPercent?: number;
    concerningUnits?: string[];
    alert?: string;
  };
  growthPotential?: {
    promotersPercent?: number;
    scaleWhere?: string;
  };
  dissatisfactionCauses?: Array<{ category: string; description: string }>;
}

/** Parte 4: conclusão e ações */
export interface InsightsPart4Conclusion {
  financialImpactSummary?: string;
  top3Actions?: string[];
}

export interface InsightsStructuredData {
  part1_byUnit?: InsightsPart1Unit[];
  part2_comparison?: InsightsPart2Comparison;
  part3_summary?: InsightsPart3Summary;
  part4_conclusion?: InsightsPart4Conclusion;
}

export interface InsightsRunPayload {
  report: string;
  generatedAt: string;
  /** Contrato fixo preenchido pelo backend em toda análise; frontend sempre pode exibir gráficos a partir disso. */
  data?: InsightsStructuredData;
}

/** Verifica se o payload tem o contrato de dados estruturado (sempre presente em análises novas). */
export function hasStructuredData(
  payload: unknown,
): payload is InsightsRunPayload & { data: InsightsStructuredData } {
  const p = payload as InsightsRunPayload | undefined;
  return (
    p != null &&
    typeof p === "object" &&
    "data" in p &&
    p.data != null &&
    typeof p.data === "object"
  );
}

export interface AIAnalysisRun {
  id: number;
  enterprise_id: number;
  type: string;
  payload: InsightsRunPayload;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateInsightsResponse {
  id: number;
  report: string;
  generatedAt: string;
}
