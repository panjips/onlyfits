import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  organizationDetailQuery,
  organizationListQuery,
} from "@/features/organization";
import { organizationBranchListQuery } from "@/features/branch";
import type { OrganizationResponse } from "@/features/organization";
import type { BranchResponse } from "@/features/branch";
import { useUser } from "@/provider";

interface PlansContextValue {
  // Organization selection (super_admin can select, admin is locked)
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  organizations: OrganizationResponse[] | undefined;
  isLoadingOrganizations: boolean;

  // Branch selection
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  branches: BranchResponse[] | undefined;
  isLoadingBranches: boolean;

  // User role helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
}

const PlansContext = createContext<PlansContextValue | null>(null);

interface PlansProviderProps {
  children: React.ReactNode;
}

export const PlansProvider = ({ children }: PlansProviderProps) => {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { user } = useUser();

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";

  // Fetch all organizations for super_admin
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    ...organizationListQuery(),
    enabled: isSuperAdmin,
  });

  // Fetch single organization for admin
  const { data: adminOrganization, isLoading: isLoadingAdminOrganization } =
    useQuery({
      ...organizationDetailQuery(user?.organizationId || ""),
      enabled: isAdmin && !!user?.organizationId,
    });

  // Fetch branches based on selected organization
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    ...organizationBranchListQuery({
      organizationId: selectedOrganizationId,
    }),
    enabled: !!selectedOrganizationId,
  });

  // Set initial organization selection based on role
  useEffect(() => {
    if (selectedOrganizationId) return;

    if (isAdmin && user?.organizationId) {
      // Admin: automatically set their organization (locked)
      setSelectedOrganizationId(user.organizationId);
    } else if (isSuperAdmin && organizations && organizations.length > 0) {
      // Super Admin: select first organization as default (they can change it)
      setSelectedOrganizationId(organizations[0].id);
    }
  }, [user, organizations, selectedOrganizationId, isAdmin, isSuperAdmin]);

  // Reset branch selection when organization changes
  useEffect(() => {
    setSelectedBranchId("");
  }, [selectedOrganizationId]);

  // Set initial branch selection
  useEffect(() => {
    if (selectedBranchId) return;

    if (branches && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  // Get the list of organizations to display
  const displayOrganizations = isSuperAdmin
    ? organizations
    : adminOrganization
      ? [adminOrganization]
      : [];

  return (
    <PlansContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId,
        organizations: displayOrganizations,
        isLoadingOrganizations: isSuperAdmin
          ? isLoadingOrganizations
          : isLoadingAdminOrganization,
        selectedBranchId,
        setSelectedBranchId,
        branches,
        isLoadingBranches,
        isSuperAdmin,
        isAdmin,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
};

export const usePlansContext = () => {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error("usePlansContext must be used within a PlansProvider");
  }
  return context;
};
