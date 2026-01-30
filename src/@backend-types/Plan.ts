import PlanPrice from "./PlanPrice";

export interface PlanFeatures {
  max_boxes: number | null;
  max_responses_per_month: number | null;
  can_access_reports: boolean;
  can_access_advanced_charts: boolean;
  can_filter_feedbacks: boolean;
  can_export_csv: boolean;
  show_mentionone_branding: boolean;
}

export interface PlanProps {
  id?: number;
  name: string;
  description?: string;
  features?: PlanFeatures | null;
  created_at?: string;
}

export interface PlanResponse {
  id: number;
  name: string;
  description: string;
  features: PlanFeatures | null;
  created_at: string;
  plan_price: PlanPrice[];
}

export default class Plan {
  readonly id?: number;
  readonly name: string;
  readonly description?: string;
  readonly features?: PlanFeatures | null;
  readonly created_at?: string;

  constructor({
    id,
    name,
    description,
    features,
    created_at,
  }: PlanProps) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.features = features;
    this.created_at = created_at;
  }
}
