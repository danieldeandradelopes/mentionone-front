export interface NPSAnalyticsOverall {
  totalResponses: number;
  withScore: number;
  averageNps: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  npsPercentage: number | null;
}

export interface NPSAnalyticsByGroup {
  id: string;
  name: string;
  totalResponses: number;
  withScore: number;
  averageNps: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  npsPercentage: number | null;
}

export interface NPSAnalyticsRecent {
  id: number;
  campaignName: string;
  branchName: string | null;
  npsScore: number | null;
  createdAt: string;
}

export interface NPSAnalyticsByMonth {
  month: string;
  label: string;
  count: number;
  withScore: number;
  averageNps: number | null;
}

export interface NPSAnalyticsPayload {
  overall: NPSAnalyticsOverall;
  byCampaign: NPSAnalyticsByGroup[];
  byBranch: NPSAnalyticsByGroup[];
  recentResponses: NPSAnalyticsRecent[];
  byMonth: NPSAnalyticsByMonth[];
}
