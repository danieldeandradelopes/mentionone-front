export interface BoxesProps {
  id: number;
  enterprise_id: number;
  name: string;
  location: string;
  slug: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type BoxesStoreData = {
  enterprise_id: number;
  name: string;
  location: string;
  slug: string;
  image_url?: string;
};

export type BoxesUpdateData = Partial<{
  name: string;
  location: string;
  slug: string;
  image_url?: string;
}> & { id: number };

export default class Boxes {
  readonly id: number;
  readonly enterprise_id: number;
  readonly name: string;
  readonly location: string;
  readonly slug: string;
  readonly image_url?: string;
  readonly created_at?: string;
  readonly updated_at?: string;

  constructor(props: BoxesProps) {
    this.id = props.id;
    this.enterprise_id = props.enterprise_id;
    this.name = props.name;
    this.location = props.location;
    this.slug = props.slug;
    this.image_url = props.image_url;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }
}
