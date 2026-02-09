import type { MemberListFilter } from "../types";

export const memberKeys = {
  all: ["member"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (params?: MemberListFilter) => [...memberKeys.lists(), params] as const,
  details: () => [...memberKeys.all, "detail"] as const,
  detail: (id: string) => [...memberKeys.details(), id] as const,
  create: () => [...memberKeys.all, "create"] as const,
  update: () => [...memberKeys.all, "update"] as const,
  delete: () => [...memberKeys.all, "delete"] as const,
};
