export const BRANCHES_KEYS = {
  all: () => ["branches"] as const,
  lists: () => [...BRANCHES_KEYS.all(), "list"] as const,
  list: () => [...BRANCHES_KEYS.lists()] as const,
  details: () => [...BRANCHES_KEYS.all(), "detail"] as const,
  detail: (id: number) => [...BRANCHES_KEYS.details(), id] as const,
} as const;
