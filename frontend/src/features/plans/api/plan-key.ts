import type { PlanListFilter } from "../types";

export const planKeys = {
  all: ["plan"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params?: PlanListFilter) => [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  create: () => [...planKeys.all, "create"] as const,
  update: () => [...planKeys.all, "update"] as const,
  delete: () => [...planKeys.all, "delete"] as const,
};
