export const moduleKeys = {
  all: ["module"] as const,
  lists: () => [...moduleKeys.all, "list"] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    [...moduleKeys.lists(), params] as const,
  details: () => [...moduleKeys.all, "detail"] as const,
  detail: (id: string) => [...moduleKeys.details(), id] as const,
  create: () => [...moduleKeys.all, "create"] as const,
  update: () => [...moduleKeys.all, "update"] as const,
  delete: () => [...moduleKeys.all, "delete"] as const,
};
