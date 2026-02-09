import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import { deleteMemberMutation, memberKeys, memberListQuery } from "../api";
import { getColumns, FilterByBranch } from "../components";
import { useMemberContext } from "../provider";
import { useConfirmDelete } from "@/provider";

export const ListMemberPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirmDelete = useConfirmDelete();

  const {
    selectedBranchId,
    setSelectedBranchId,
    branches,
    isLoadingBranches,
    selectedBranchName,
    isAdmin,
    isStaff,
    userOrganizationId,
  } = useMemberContext();

  // Query members with branch filter
  const { data, isLoading } = useQuery({
    ...memberListQuery({
      organizationId: userOrganizationId,
      branchId: selectedBranchId || undefined,
    }),
    enabled: !!selectedBranchId || !!userOrganizationId,
  });

  const deleteMember = useMutation({
    ...deleteMemberMutation,
    onSuccess: (data) => {
      deleteMemberMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });

  const onAddMember = () => {
    navigate({ to: "/members/create" });
  };

  const onUpdate = (id: string) => {
    navigate({ to: "/members/$id/update", params: { id } });
  };

  const onDelete = async (id: string) => {
    await confirmDelete("this member", async () => {
      deleteMember.mutate(id);
    });
  };

  const columns = getColumns({ onUpdate, onDelete });

  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="Members"
        description="Manage your gym members here."
        isAction={true}
        actionLabel="Add Member"
        onAction={onAddMember}
      />
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={
          isLoading && !data && (!!selectedBranchId || !!userOrganizationId)
        }
        extraComponents={
          // Only show branch selector for admin users
          isAdmin && branches && branches.length > 0 ? (
            <FilterByBranch
              className="h-10"
              value={selectedBranchId}
              onChange={handleBranchChange}
              branches={branches}
              isLoading={isLoadingBranches}
            />
          ) : isStaff && selectedBranchName ? (
            // For staff, show a simple info about their branch
            <div className="flex items-center h-10 px-3 text-sm text-muted-foreground bg-muted rounded-md">
              {selectedBranchName}
            </div>
          ) : null
        }
      />
    </div>
  );
};
