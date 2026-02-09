export const organizationKeys = {
  all: ["organization"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  create: () => [...organizationKeys.all, "create"] as const,
  update: () => [...organizationKeys.all, "update"] as const,
  delete: () => [...organizationKeys.all, "delete"] as const,
};
