export const PLAN_KEYS = {
  all: () => ["plans"] as const,
  list: () => [...PLAN_KEYS.all(), "list"] as const,
} as const;
