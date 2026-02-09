import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/provider";
import type { UserListParams, UserResponse } from "../types";
import {
  organizationDetailQuery,
  organizationListQuery,
  type OrganizationResponse,
} from "@/features/organization";
import { useUserList } from "../hooks/use-user";

interface UserContextValue {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  users: UserResponse[];
  filters: UserListParams;
  isLoading: boolean;
  isFetching: boolean;
  organizations: OrganizationResponse[] | undefined;
  isLoadingOrganizations: boolean;
  updateFilters: (newFilters: Partial<UserListParams>) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const { user, isLoading: isLoadingUser } = useUser();

  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
    ...organizationListQuery(),
    enabled: user?.role === "super_admin",
  });

  const { data: organization, isLoading: isLoadingOrganization } = useQuery({
    ...organizationDetailQuery(user?.organizationId || ""),
    enabled: user?.role === "admin" && !isLoadingUser,
  });

  useEffect(() => {
    if (selectedOrganizationId) return;

    if (user?.role === "admin" && user.organizationId) {
      setSelectedOrganizationId(user.organizationId);
    } else if (
      user?.role === "super_admin" &&
      organizations &&
      organizations.length > 0
    ) {
      setSelectedOrganizationId(organizations[0].id);
    }
  }, [user, organizations, selectedOrganizationId]);

  const { users, isLoading, isFetching, updateFilters, filters } = useUserList({
    initialFilters: {
      page: 1,
      limit: 10,
      organizationId: user?.organizationId,
    },
    enabled: !!selectedOrganizationId,
  });

  const value = {
    selectedOrganizationId,
    setSelectedOrganizationId,
    users,
    isLoading,
    organizations:
      user?.role === "super_admin"
        ? organizations
        : organization
          ? [organization]
          : [],
    isLoadingOrganizations:
      user?.role === "super_admin" ? isLoadingOrgs : isLoadingOrganization,
    isFetching,
    updateFilters,
    filters,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
