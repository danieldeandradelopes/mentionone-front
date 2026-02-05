import Branding from "./Branding";
import Phone from "./Phone";
import SocialMedia from "./SocialMedia";

export interface EnterpriseDTO {
  id: number;
  name: string;
  cover?: string | null;
  address?: string | null;
  description?: string | null;
  subdomain?: string | null;
  document?: string | null;
  document_type?: "cpf" | "cnpj" | null;
  email?: string | null;
  timezone: string;
  terms_accepted_at?: string | null;
  terms_accepted_ip?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EnterpriseProps extends EnterpriseDTO {
  social_medias?: SocialMedia[];
  phones?: Phone[];
  branding?: Branding[];
}

export type EnterpriseWithDefaultTemplate = Omit<
  EnterpriseProps,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & {
  plan_price_id: number;
};

export default class Enterprise {
  readonly id: number;
  readonly name: string;
  readonly cover?: string | null;
  readonly address?: string | null;
  readonly description?: string | null;
  readonly subdomain?: string | null;
  readonly document?: string | null;
  readonly document_type?: "cpf" | "cnpj" | null;
  readonly email?: string | null;
  readonly timezone: string;
  readonly terms_accepted_at?: string | null;
  readonly terms_accepted_ip?: string | null;
  readonly deleted_at?: string | null;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly social_medias?: SocialMedia[];
  readonly phones?: Phone[];
  readonly branding?: Branding[];

  constructor(data: EnterpriseProps) {
    this.id = data.id;
    this.name = data.name;
    this.cover = data.cover;
    this.address = data.address;
    this.description = data.description;
    this.subdomain = data.subdomain;
    this.document = data.document;
    this.document_type = data.document_type;
    this.email = data.email;
    this.timezone = data.timezone || "America/Sao_Paulo";
    this.terms_accepted_at = data.terms_accepted_at;
    this.terms_accepted_ip = data.terms_accepted_ip;
    this.deleted_at = data.deleted_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.social_medias = data.social_medias;
    this.phones = data.phones;
    this.branding = data.branding;
  }
}
