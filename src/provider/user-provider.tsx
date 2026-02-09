import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { profileQuery } from "@/features/dashboard";
import { dashboardKeys } from "@/features/dashboard/api/keys";
import type { ProfileResponse } from "@/features/dashboard/types";
import Cookies from "js-cookie";

interface UserContextState {
  user: ProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetchUser: () => Promise<void>;
  clearUser: () => void;
}

const initialState: UserContextState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  refetchUser: async () => {},
  clearUser: () => {},
};

const UserContext = createContext<UserContextState>(initialState);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = Cookies.get("token");

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...profileQuery,
    retry: false,
    enabled: !!token,
  });

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const clearUser = useCallback(() => {
    queryClient.removeQueries({ queryKey: dashboardKeys.profile() });
    setIsAuthenticated(false);
  }, [queryClient]);

  const value: UserContextState = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    error: error as Error | null,
    refetchUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
