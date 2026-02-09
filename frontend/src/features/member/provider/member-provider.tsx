import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  organizationBranchListQuery,
  branchDetailQuery,
} from "@/features/branch";
import type { BranchResponse } from "@/features/branch";
import { useUser } from "@/provider";

interface MemberContextValue {
  // Branch selection
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  branches: BranchResponse[] | undefined;
  isLoadingBranches: boolean;
  selectedBranchName: string | undefined;

  // User info helpers
  isAdmin: boolean;
  isStaff: boolean;
  userOrganizationId: string | undefined;
  userBranchId: string | undefined;
}

const MemberContext = createContext<MemberContextValue | null>(null);

interface MemberProviderProps {
  children: React.ReactNode;
}

export const MemberProvider = ({ children }: MemberProviderProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const { user } = useUser();

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const userOrganizationId = user?.organizationId;
  const userBranchId = user?.branchId;

  // Fetch all branches for admin users
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    ...organizationBranchListQuery({
      organizationId: userOrganizationId || "",
    }),
    enabled: isAdmin && !!userOrganizationId,
  });

  // Fetch single branch detail for staff users
  const { data: staffBranch } = useQuery({
    ...branchDetailQuery(userBranchId || ""),
    enabled: isStaff && !!userBranchId,
  });

  // Set initial branch selection based on role
  useEffect(() => {
    if (selectedBranchId) return;

    if (isStaff && userBranchId) {
      // Staff: automatically set their assigned branch
      setSelectedBranchId(userBranchId);
    } else if (isAdmin && branches && branches.length > 0) {
      // Admin: select first branch as default (they can change it)
      setSelectedBranchId(branches[0].id);
    }
  }, [user, branches, selectedBranchId, isStaff, isAdmin, userBranchId]);

  // Get selected branch name
  const selectedBranchName = isAdmin
    ? branches?.find((b) => b.id === selectedBranchId)?.name
    : staffBranch?.name;

  return (
    <MemberContext.Provider
      value={{
        selectedBranchId,
        setSelectedBranchId,
        branches: isAdmin ? branches : undefined,
        isLoadingBranches: isAdmin ? isLoadingBranches : false,
        selectedBranchName,
        isAdmin,
        isStaff,
        userOrganizationId,
        userBranchId,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error("useMemberContext must be used within a MemberProvider");
  }
  return context;
};
