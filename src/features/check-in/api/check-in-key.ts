export const checkInKeys = {
  all: ["check-in"] as const,
  scanner: () => [...checkInKeys.all, "scanner"] as const,
  sessionActivities: (branchId: string) =>
    [...checkInKeys.all, "sessions", branchId] as const,
};
