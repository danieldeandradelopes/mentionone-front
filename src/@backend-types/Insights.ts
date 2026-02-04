export interface InsightsRunPayload {
  report: string;
  generatedAt: string;
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
