import type { SubscriptionListFilter } from "../types";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (params?: SubscriptionListFilter) =>
    [...subscriptionKeys.lists(), params] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
  create: () => [...subscriptionKeys.all, "create"] as const,
  update: () => [...subscriptionKeys.all, "update"] as const,
  delete: () => [...subscriptionKeys.all, "delete"] as const,
  renew: () => [...subscriptionKeys.all, "renew"] as const,
};
