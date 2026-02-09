import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import {
  deleteSubscriptionMutation,
  subscriptionKeys,
  subscriptionListQuery,
} from "../api";
import {
  getColumns,
  FilterByBranch,
  FilterByOrganization,
  FilterByStatus,
} from "../components";
import { useSubscriptionContext } from "../provider";
import { useConfirmDelete } from "@/provider";

export const ListSubscriptionPage = () => {
  const queryClient = useQueryClient();
  const confirmDelete = useConfirmDelete();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

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
    userOrganizationId,
  } = useSubscriptionContext();

  // Build filter params based on user role
  const filterParams = {
    organizationId: isSuperAdmin
      ? selectedOrganizationId || undefined
      : userOrganizationId,
    branchId: selectedBranchId || undefined,
    status: selectedStatus || undefined,
    page: 1,
    limit: 100,
  };

  // Query subscriptions with filters
  const { data, isLoading } = useQuery({
    ...subscriptionListQuery(filterParams),
    enabled:
      (isSuperAdmin && !!selectedOrganizationId) ||
      (isAdmin && !!userOrganizationId),
  });

  const deleteSubscription = useMutation({
    ...deleteSubscriptionMutation,
    onSuccess: (data) => {
      deleteSubscriptionMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
    },
  });

  const onAddSubscription = () => {
    // TODO: Navigate to create subscription page when implemented
    console.log("Navigate to /subscriptions/create");
  };

  const onUpdate = (id: string) => {
    // TODO: Navigate to update subscription page when implemented
    console.log(`Navigate to /subscriptions/${id}/update`);
  };

  const onDelete = async (id: string) => {
    await confirmDelete("this subscription", async () => {
      deleteSubscription.mutate(id);
    });
  };

  const onRenew = (id: string, memberId: string) => {
    // TODO: Implement renew subscription functionality
    console.log(`Renew subscription ${id} for member ${memberId}`);
  };

  const columns = getColumns({ onUpdate, onDelete, onRenew });

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
    // Reset branch selection when organization changes
    setSelectedBranchId("");
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="Subscriptions"
        description="Manage member subscriptions here."
        isAction={true}
        actionLabel="Add Subscription"
        onAction={onAddSubscription}
      />
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={
          isLoading &&
          !data &&
          ((isSuperAdmin && !!selectedOrganizationId) ||
            (isAdmin && !!userOrganizationId))
        }
        extraComponents={
          <div className="flex items-center gap-2">
            {/* Super Admin: Show organization selector */}
            {isSuperAdmin && organizations && organizations.length > 0 && (
              <FilterByOrganization
                className="h-10"
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                organizations={organizations}
                isLoading={isLoadingOrganizations}
              />
            )}

            {/* Super Admin & Admin: Show branch selector */}
            {(isSuperAdmin || isAdmin) && branches && branches.length > 0 && (
              <FilterByBranch
                className="h-10"
                value={selectedBranchId}
                onChange={handleBranchChange}
                branches={branches}
                isLoading={isLoadingBranches}
              />
            )}

            {/* Status filter for all users */}
            <FilterByStatus
              className="h-10"
              value={selectedStatus}
              onChange={handleStatusChange}
            />
          </div>
        }
      />
    </div>
  );
};
