import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import {
  deletePlanMutation,
  planKeys,
  organizationPlanListQuery,
} from "../api";
import {
  getColumns,
  FilterByOrganization,
  FilterByBranch,
} from "../components";
import { usePlansContext } from "../provider";
import { useConfirmDelete } from "@/provider";

export const ListPlanPage = () => {
  const queryClient = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const navigate = useNavigate();

  const {
    selectedOrganizationId,
    setSelectedOrganizationId,
    organizations,
    isLoadingOrganizations,
    selectedBranchId,
    setSelectedBranchId,
    branches,
    isLoadingBranches,
    isSuperAdmin,
    isAdmin,
  } = usePlansContext();

  // Query plans with organization and branch filter
  const { data, isLoading } = useQuery({
    ...organizationPlanListQuery({
      organizationId: selectedOrganizationId,
      branchId: selectedBranchId || undefined,
    }),
    enabled: !!selectedOrganizationId,
  });

  const deletePlan = useMutation({
    ...deletePlanMutation,
    onSuccess: (data) => {
      deletePlanMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });

  const onAddPlan = () => {
    navigate({ to: "/billing/plans/create" });
  };

  const onUpdate = (id: string) => {
    navigate({ to: `/billing/plans/${id}/update` });
  };

  const onDelete = async (id: string) => {
    await confirmDelete("this plan", async () => {
      deletePlan.mutate(id);
    });
  };

  const columns = getColumns({ onUpdate, onDelete });

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="Billing Plans"
        description="Manage your membership plans and pricing here."
        isAction={true}
        actionLabel="Add Plan"
        onAction={onAddPlan}
      />
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading && !data && !!selectedOrganizationId}
        extraComponents={
          <div className="flex items-center gap-3">
            {/* Organization Selector - Only for Super Admin */}
            {isSuperAdmin && organizations && organizations.length > 0 && (
              <FilterByOrganization
                className="h-10"
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                organizations={organizations}
                isLoading={isLoadingOrganizations}
              />
            )}

            {/* Branch Selector - For both Super Admin and Admin */}
            {(isSuperAdmin || isAdmin) && branches && branches.length > 0 && (
              <FilterByBranch
                className="h-10"
                value={selectedBranchId}
                onChange={handleBranchChange}
                branches={branches}
                isLoading={isLoadingBranches}
              />
            )}

            {/* Show locked organization info for Admin */}
            {isAdmin && organizations && organizations.length > 0 && (
              <div className="flex items-center h-10 px-3 text-sm text-muted-foreground bg-muted rounded-md">
                {organizations[0]?.name || "Your Organization"}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};
