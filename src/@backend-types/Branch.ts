export interface Branch {
  id: number;
  enterprise_id: number;
  name: string;
  slug: string;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type BranchStoreData = {
  name: string;
  slug?: string;
  address?: string | null;
};

export type BranchUpdateData = Partial<BranchStoreData> & { id: number };
