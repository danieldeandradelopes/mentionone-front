export const NPS_CAMPAIGNS_KEYS = {
  all: () => ["nps-campaigns"] as const,
  list: () => [...NPS_CAMPAIGNS_KEYS.all(), "list"] as const,
  detail: (id: number) => [...NPS_CAMPAIGNS_KEYS.all(), "detail", id] as const,
  analytics: () => [...NPS_CAMPAIGNS_KEYS.all(), "analytics"] as const,
  publicBySlug: (slug: string) =>
    [...NPS_CAMPAIGNS_KEYS.all(), "public", slug] as const,
};
