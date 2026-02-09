import { useCallback, useState } from "react";
import type { UserListParams } from "../types";
import { useQuery } from "@tanstack/react-query";
import { userListQuery } from "../api";

export interface UseUserListOptions {
  initialFilters?: UserListParams;
  enabled?: boolean;
}

export const useUserList = ({
  initialFilters,
  enabled,
}: UseUserListOptions) => {
  const [filters, setFilters] = useState<UserListParams>(
    initialFilters || {
      page: 1,
      limit: 10,
    }
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    ...userListQuery(filters),
    enabled,
  });

  const updateFilters = useCallback((newFilters: Partial<UserListParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: "page" in newFilters ? newFilters.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10 });
  }, []);

  return {
    users: data || [],
    filters,
    isLoading,
    isFetching,
    error,
    refetch,
    updateFilters,
    resetFilters,
  };
};
