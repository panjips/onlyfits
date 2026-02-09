import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizationBranchListQuery } from "@/features/branch";
import type { BranchResponse } from "@/features/branch";
import { organizationListQuery } from "@/features/organization";
import type { OrganizationResponse } from "@/features/organization";
import { useUser } from "@/provider";

interface SubscriptionContextValue {
  // Organization selection (for super_admin)
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  organizations: OrganizationResponse[] | undefined;
  isLoadingOrganizations: boolean;

  // Branch selection
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  branches: BranchResponse[] | undefined;
  isLoadingBranches: boolean;
  selectedBranchName: string | undefined;

  // User info helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
  userOrganizationId: string | undefined;
  userBranchId: string | undefined;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider = ({
  children,
}: SubscriptionProviderProps) => {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { user } = useUser();

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const userOrganizationId = user?.organizationId;
  const userBranchId = user?.branchId;

  // Fetch all organizations for super_admin users
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    ...organizationListQuery(),
    enabled: isSuperAdmin,
  });

  // Determine which organization to use for fetching branches
  const effectiveOrganizationId = isSuperAdmin
    ? selectedOrganizationId
    : userOrganizationId;

  // Fetch branches based on selected organization (for super_admin) or user's organization (for admin)
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    ...organizationBranchListQuery({
      organizationId: effectiveOrganizationId || "",
    }),
    enabled: (isSuperAdmin || isAdmin) && !!effectiveOrganizationId,
  });

  // Set initial organization selection for super_admin
  useEffect(() => {
    if (isSuperAdmin && organizations && organizations.length > 0) {
      if (!selectedOrganizationId) {
        setSelectedOrganizationId(organizations[0].id);
      }
    } else if (isAdmin && userOrganizationId) {
      // Admin: lock to their organization
      setSelectedOrganizationId(userOrganizationId);
    }
  }, [
    isSuperAdmin,
    isAdmin,
    organizations,
    selectedOrganizationId,
    userOrganizationId,
  ]);

  // Set initial branch selection based on role
  useEffect(() => {
    if (selectedBranchId) return;

    if (branches && branches.length > 0) {
      // Select first branch as default
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  // Get selected branch name
  const selectedBranchName = branches?.find(
    (b) => b.id === selectedBranchId
  )?.name;

  return (
    <SubscriptionContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId,
        organizations: isSuperAdmin ? organizations : undefined,
        isLoadingOrganizations: isSuperAdmin ? isLoadingOrganizations : false,
        selectedBranchId,
        setSelectedBranchId,
        branches: isSuperAdmin || isAdmin ? branches : undefined,
        isLoadingBranches: isSuperAdmin || isAdmin ? isLoadingBranches : false,
        selectedBranchName,
        isSuperAdmin,
        isAdmin,
        userOrganizationId,
        userBranchId,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
};
