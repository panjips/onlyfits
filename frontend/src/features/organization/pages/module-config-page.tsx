import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import { moduleListQuery, deleteModuleMutation } from "../api/module-api";
import { getModuleColumns } from "../components";
import { useNavigate } from "@tanstack/react-router";
import { moduleKeys } from "../api/module-key";

export const ModuleConfigPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useQuery(moduleListQuery());

  const deleteModule = useMutation({
    ...deleteModuleMutation,
    onSuccess: (data) => {
      deleteModuleMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: moduleKeys.lists() });
    },
  });

  const onAddModule = () => {
    navigate({ to: "/organization/modules/create" });
  };

  const onUpdate = (id: string) => {
    navigate({ to: `/organization/modules/${id}/update` });
  };

  const onDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      deleteModule.mutate(id);
    }
  };

  const columns = getModuleColumns({ onUpdate, onDelete });

  return (
    <div className="space-y-6">
      <TitlePage
        title="Module Configuration"
        description="Configure and manage modules for your organization."
        isAction={true}
        actionLabel="Add Module"
        onAction={onAddModule}
      />
      <DataTable
        isLoading={isLoading || isFetching}
        columns={columns}
        data={Array.isArray(data) ? data : data || []}
      />
    </div>
  );
};
