import { useQuery } from "@tanstack/react-query";
import { wellnessAnalyticsQuery } from "../api/api";

export const useWellnessAnalytics = () => {
  return useQuery(wellnessAnalyticsQuery());
};
