import type { UserListParams } from "../types";

export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  create: () => [...userKeys.all, "create"] as const,
  update: () => [...userKeys.all, "update"] as const,
  delete: () => [...userKeys.all, "delete"] as const,
};
