import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import { UserFilters, getUserColumns } from "../components";
import { useUserContext } from "../provider";
import { useConfirmDelete } from "@/provider";
import type { UserResponse } from "../types";
import { useDeleteUser } from "../hooks/use-delete-user";

export const ListTeamPage = () => {
  const navigate = useNavigate();
  const { users, filters, isLoading, isFetching, updateFilters } =
    useUserContext();
  const { deleteUser } = useDeleteUser();
  const confirmDelete = useConfirmDelete();

  const handleEdit = (user: UserResponse) => {
    navigate({ to: `/users/team/${user.id}/update` });
  };

  const handleDelete = async (user: UserResponse) => {
    await confirmDelete(user.fullName, async () => {
      await deleteUser(user.id);
    });
  };

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    []
  );

  const onAddTeamMember = () => {
    navigate({ to: "/users/team/create" });
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="Team Management"
        description="Manage team members in your organization"
        isAction={true}
        actionLabel="Add Team Member"
        onAction={onAddTeamMember}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading || isFetching}
        extraComponents={
          <UserFilters filters={filters} onFiltersChange={updateFilters} />
        }
      />
    </div>
  );
};
