export const branchKeys = {
  all: ["branch"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (params?: { page?: number; limit?: number; search?: string; organizationId?: string }) =>
    [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
  create: () => [...branchKeys.all, "create"] as const,
  update: () => [...branchKeys.all, "update"] as const,
  delete: () => [...branchKeys.all, "delete"] as const,
};
