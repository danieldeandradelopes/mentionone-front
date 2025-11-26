export interface FeedbackProps {
  id: number;
  enterprise_id: number;
  box_id: number;
  text: string;
  category: string;
  status: string;
  response?: string | null;
  rating?: number | null;
  attachments?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export type FeedbackStoreData = {
  enterprise_id: number;
  box_id: number;
  text: string;
  category: string;
  status?: string;
  response?: string | null;
  rating?: number | null;
  attachments?: string[] | null;
};

// Tipo para criação via slug (frontend envia slug, backend resolve ID)
export type FeedbackStoreDataWithSlug = Omit<
  FeedbackStoreData,
  "box_id" | "enterprise_id"
> & {
  box_slug: string;
};

export type FeedbackUpdateData = Partial<
  Omit<FeedbackStoreData, "enterprise_id" | "box_id">
> & { id: number };

export default class Feedback {
  readonly id: number;
  readonly enterprise_id: number;
  readonly box_id: number;
  readonly text: string;
  readonly category: string;
  readonly status: string;
  readonly response?: string | null;
  readonly rating?: number | null;
  readonly attachments?: string[] | null;
  readonly created_at?: string;
  readonly updated_at?: string;

  constructor(props: FeedbackProps) {
    this.id = props.id;
    this.enterprise_id = props.enterprise_id;
    this.box_id = props.box_id;
    this.text = props.text;
    this.category = props.category;
    this.status = props.status;
    this.response = props.response;
    this.rating = props.rating;
    this.attachments = props.attachments;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }
}
