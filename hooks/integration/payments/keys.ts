export const PAYMENT_KEYS = {
  all: () => ["payments"] as const,
  list: () => [...PAYMENT_KEYS.all(), "list"] as const,
} as const;
