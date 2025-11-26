export const FEEDBACK_KEYS = {
  all: () => ["feedbacks"] as const,
  lists: () => [...FEEDBACK_KEYS.all(), "list"] as const,
  list: () => [...FEEDBACK_KEYS.lists()] as const,
  details: () => [...FEEDBACK_KEYS.all(), "detail"] as const,
  detail: (id: number) => [...FEEDBACK_KEYS.details(), id] as const,
  byBox: (boxId: number) => [...FEEDBACK_KEYS.all(), "box", boxId] as const,
} as const;
