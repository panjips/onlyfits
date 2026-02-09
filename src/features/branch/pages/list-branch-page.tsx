import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import {
  deleteBranchMutation,
  branchKeys,
  organizationBranchListQuery,
} from "../api";
import { getColumns, FilterByOrganization } from "../components";
import { useNavigate } from "@tanstack/react-router";
import { useBranchContext } from "../provider";
import { useConfirmDelete } from "@/provider";

export const ListBranchPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirmDelete = useConfirmDelete();

  const {
    selectedOrganizationId,
    setSelectedOrganizationId,
    organizations,
    isLoadingOrganizations,
  } = useBranchContext();

  const { data, isLoading } = useQuery({
    ...organizationBranchListQuery({
      organizationId: selectedOrganizationId,
    }),
    enabled: !!selectedOrganizationId,
  });

  const deleteBranch = useMutation({
    ...deleteBranchMutation,
    onSuccess: (data) => {
      deleteBranchMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });

  const onAddBranch = () => {
    navigate({ to: "/branches/create" });
  };

  const onUpdate = (id: string) => {
    navigate({ to: `/branches/${id}/update` });
  };

  const onDelete = async (id: string) => {
    await confirmDelete("this branch", async () => {
      deleteBranch.mutate(id);
    });
  };

  const columns = getColumns({ onUpdate, onDelete });

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="Branches"
        description="Manage your gym locations here."
        isAction={true}
        actionLabel="Add Branch"
        onAction={onAddBranch}
      />
      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading && !data && !!selectedOrganizationId}
        extraComponents={
          <FilterByOrganization
            className="h-10"
            value={selectedOrganizationId}
            onChange={handleOrganizationChange}
            organizations={organizations}
            isLoading={isLoadingOrganizations}
          />
        }
      />
    </div>
  );
};
