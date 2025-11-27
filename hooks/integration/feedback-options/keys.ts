export const FEEDBACK_OPTIONS_KEYS = {
  all: () => ["feedback-options"] as const,
  lists: () => [...FEEDBACK_OPTIONS_KEYS.all(), "list"] as const,
  list: () => [...FEEDBACK_OPTIONS_KEYS.lists()] as const,
  byBox: (boxId: number) =>
    [...FEEDBACK_OPTIONS_KEYS.all(), "box", boxId] as const,
  details: () => [...FEEDBACK_OPTIONS_KEYS.all(), "detail"] as const,
  detail: (id: number) => [...FEEDBACK_OPTIONS_KEYS.details(), id] as const,
} as const;
