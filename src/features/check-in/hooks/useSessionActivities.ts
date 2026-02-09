import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  sessionActivitiesQuery,
  type SessionActivityResponse,
} from "../api/check-in-api";
import { checkInKeys } from "../api/check-in-key";
import type { CheckInLogEntry, CheckInType } from "../types";

/**
 * Transform backend session activity response to frontend CheckInLogEntry format
 */
const transformToLogEntries = (
  activities: SessionActivityResponse[],
): CheckInLogEntry[] => {
  const entries: CheckInLogEntry[] = [];

  for (const activity of activities) {
    // Add check-in entry
    entries.push({
      id: `${activity.id}-in`,
      memberName: activity.member_name,
      memberEmail: "", // Not provided by backend
      type: "check-in" as CheckInType,
      timestamp: new Date(activity.check_in_time),
      memberId: activity.member_id,
    });

    // Add check-out entry if exists
    if (activity.check_out_time) {
      entries.push({
        id: `${activity.id}-out`,
        memberName: activity.member_name,
        memberEmail: "",
        type: "check-out" as CheckInType,
        timestamp: new Date(activity.check_out_time),
        memberId: activity.member_id,
      });
    }
  }

  // Sort by timestamp descending (most recent first)
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

interface UseSessionActivitiesOptions {
  branchId?: string;
}

export function useSessionActivities({
  branchId,
}: UseSessionActivitiesOptions) {
  const queryClient = useQueryClient();

  const {
    data: rawActivities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...sessionActivitiesQuery(branchId ?? ""),
    enabled: !!branchId,
  });

  const entries = rawActivities ? transformToLogEntries(rawActivities) : [];

  const invalidateActivities = useCallback(() => {
    if (branchId) {
      queryClient.invalidateQueries({
        queryKey: checkInKeys.sessionActivities(branchId),
      });
    }
  }, [branchId, queryClient]);

  return {
    entries,
    isLoading,
    error: error as Error | null,
    refetch,
    invalidateActivities,
  };
}
