export type NPSQuestionType = "nps" | "multiple_choice";

export interface NPSQuestionOption {
  id: number;
  nps_question_id: number;
  label: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface NPSQuestion {
  id: number;
  nps_campaign_id: number;
  title: string;
  type: NPSQuestionType;
  order: number;
  created_at?: string;
  updated_at?: string;
  options?: NPSQuestionOption[];
}

export interface NPSCampaign {
  id: number;
  enterprise_id: number;
  name: string;
  slug: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NPSCampaignWithQuestions extends NPSCampaign {
  questions: (NPSQuestion & { options: NPSQuestionOption[] })[];
}

export type NPSCampaignStorePayload = {
  name: string;
  slug?: string;
  active?: boolean;
  questions?: NPSQuestionInput[];
};

export type NPSQuestionInput = {
  title: string;
  type: NPSQuestionType;
  order?: number;
  options?: { label: string; order?: number }[];
};

export type NPSResponsePayload = {
  nps_score?: number | null;
  branch_id?: number | null;
  branch_slug?: string | null;
  answers?: { question_id: number; option_id: number }[];
};
