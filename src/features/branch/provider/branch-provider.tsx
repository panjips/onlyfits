import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  organizationDetailQuery,
  organizationListQuery,
} from "@/features/organization";
import type { OrganizationResponse } from "@/features/organization";
import { useUser } from "@/provider";

interface BranchContextValue {
  selectedOrganizationId: string;
  setSelectedOrganizationId: (id: string) => void;
  organizations: OrganizationResponse[] | undefined;
  isLoadingOrganizations: boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

interface BranchProviderProps {
  children: React.ReactNode;
}

export const BranchProvider = ({ children }: BranchProviderProps) => {
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const { user } = useUser();

  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    ...organizationListQuery(),
    enabled: user?.role === "super_admin",
  });

  const { data: organization, isLoading: isLoadingOrganization } = useQuery({
    ...organizationDetailQuery(user?.organizationId || ""),
    enabled: user?.role === "admin",
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

  return (
    <BranchContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId,
        organizations:
          user?.role === "super_admin"
            ? organizations
            : organization
              ? [organization]
              : [],
        isLoadingOrganizations:
          user?.role === "super_admin"
            ? isLoadingOrganizations
            : isLoadingOrganization,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranchContext = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranchContext must be used within a BranchProvider");
  }
  return context;
};
