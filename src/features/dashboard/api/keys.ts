export const dashboardKeys = {
  all: ["dashboard"] as const,
  profile: () => [...dashboardKeys.all, "profile"] as const,
  qr: () => [...dashboardKeys.all, "qr"] as const,
  visitorCount: (branchId: string) =>
    [...dashboardKeys.all, "visitorCount", branchId] as const,
  attendance: (startDate: string, endDate: string) =>
    [...dashboardKeys.all, "attendance", startDate, endDate] as const,
  analytics: () => [...dashboardKeys.all, "analytics"] as const,
};
