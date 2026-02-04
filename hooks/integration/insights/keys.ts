export const INSIGHTS_KEYS = {
  all: () => ["insights"] as const,
  latest: () => [...INSIGHTS_KEYS.all(), "latest"] as const,
  history: (limit?: number) =>
    [...INSIGHTS_KEYS.all(), "history", limit ?? 50] as const,
  detail: (id: number) => [...INSIGHTS_KEYS.all(), "detail", id] as const,
};
