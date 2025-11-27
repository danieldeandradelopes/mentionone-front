export const ENTERPRISE_KEYS = {
  all: () => ["enterprise"] as const,
  details: () => [...ENTERPRISE_KEYS.all(), "detail"] as const,
  detail: (id?: number) => [...ENTERPRISE_KEYS.details(), id] as const,
  settings: () => [...ENTERPRISE_KEYS.all(), "settings"] as const,
  branding: () => [...ENTERPRISE_KEYS.all(), "branding"] as const,
} as const;
