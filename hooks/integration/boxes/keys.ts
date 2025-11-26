export interface CreateBoxData {
  name: string;
  location: string;
  slug: string;
}

export interface UpdateBoxData {
  id: number;
  name?: string;
  location?: string;
}

export const BOXES_KEYS = {
  all: () => ["boxes"] as const,
  lists: () => [...BOXES_KEYS.all(), "list"] as const,
  list: () => [...BOXES_KEYS.lists()] as const,
  details: () => [...BOXES_KEYS.all(), "detail"] as const,
  detail: (id: number) => [...BOXES_KEYS.details(), id] as const,
} as const;
