import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizationBranchListQuery } from "@/features/branch";
import type { UserListParams } from "../types";
import { FilterByBranch } from "./filter-by-branch";
import { FilterByRole } from "./filter-by-role";
import { useUser } from "@/provider";
import { useUserContext } from "../provider";

export interface UserFiltersProps {
  filters: UserListParams;
  onFiltersChange: (filters: UserListParams) => void;
  className?: string;
}

export const UserFilters = ({
  filters,
  onFiltersChange,
  className,
}: UserFiltersProps) => {
  const {
    selectedOrganizationId,
    setSelectedOrganizationId,
    isLoadingOrganizations,
    organizations,
  } = useUserContext();
  const { user } = useUser();

  const isDisabled = useMemo(() => {
    return user?.role === "admin";
  }, [user]);

  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    ...organizationBranchListQuery({ organizationId: selectedOrganizationId }),
    enabled: selectedOrganizationId !== "all" && !!selectedOrganizationId,
  });

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
    onFiltersChange({
      ...filters,
      organizationId: value === "all" ? undefined : value,
      branchId: undefined,
    });
  };

  const handleBranchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      branchId: value === "all" ? undefined : value,
    });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({
      ...filters,
      role: value === "all" ? undefined : value,
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className || ""}`}>
      {/* Organization Filter */}
      <Select
        value={selectedOrganizationId}
        onValueChange={handleOrganizationChange}
        disabled={isLoadingOrganizations || isDisabled}
      >
        <SelectTrigger className="min-w-[200px] gap-2 h-10!">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="All Organizations" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {isLoadingOrganizations ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="all">
                <span className="text-muted-foreground">All Organizations</span>
              </SelectItem>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center gap-2">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="size-4 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="size-4" />
                    )}
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {/* Branch Filter - disabled when "All Organizations" is selected */}
      <FilterByBranch
        value={filters.branchId || "all"}
        onChange={handleBranchChange}
        branches={branches || []}
        isLoading={isLoadingBranches}
        disabled={selectedOrganizationId === "all"}
        showAll={true}
      />

      {/* Role Filter */}
      <FilterByRole
        value={filters.role || "all"}
        onChange={handleRoleChange}
        showAll={true}
        includeSuperAdmin={true}
      />
    </div>
  );
};
