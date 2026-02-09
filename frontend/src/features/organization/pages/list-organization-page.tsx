import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import {
  organizationListQuery,
  deleteOrganizationMutation,
} from "../api/org-api";
import { getColumns } from "../components";
import { useNavigate } from "@tanstack/react-router";
import { organizationKeys } from "../api/org-key";
import { useConfirmDelete } from "@/provider";

export const ListOrganizationPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirmDelete = useConfirmDelete();
  const { data, isLoading } = useQuery(organizationListQuery());

  const deleteOrg = useMutation({
    ...deleteOrganizationMutation,
    onSuccess: (data) => {
      deleteOrganizationMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onAddOrganization = () => {
    navigate({ to: "/organization/create" });
  };

  const onUpdate = (id: string) => {
    navigate({ to: `/organization/${id}/update` });
  };

  const onDelete = async (id: string) => {
    await confirmDelete("this organization", async () => {
      deleteOrg.mutate(id);
    });
  };

  const columns = getColumns({ onUpdate, onDelete });

  return (
    <div className="space-y-6">
      <TitlePage
        title="Organizations"
        description="Manage your organizations here."
        isAction={true}
        onAction={onAddOrganization}
      />
      <DataTable
        columns={columns}
        data={Array.isArray(data) ? data : data || []}
      />
    </div>
  );
};
