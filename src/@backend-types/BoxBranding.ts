export interface BoxBrandingProps {
  id: number;
  box_id: number;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  client_name?: string;
  show_mentionone_branding?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default class BoxBranding {
  readonly id: number;
  readonly box_id: number;
  readonly primary_color: string;
  readonly secondary_color: string;
  readonly logo_url?: string;
  readonly client_name?: string;
  readonly show_mentionone_branding?: boolean;
  readonly created_at?: string;
  readonly updated_at?: string;

  constructor(props: BoxBrandingProps) {
    this.id = props.id;
    this.box_id = props.box_id;
    this.primary_color = props.primary_color;
    this.secondary_color = props.secondary_color;
    this.logo_url = props.logo_url;
    this.client_name = props.client_name;
    this.show_mentionone_branding = props.show_mentionone_branding;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }
}
