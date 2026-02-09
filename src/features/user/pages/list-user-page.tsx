import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { TitlePage } from "@/components/shared";
import { DataTable } from "@/components/table/data-table";
import { UserFilters, getUserColumns } from "../components";
import { useUserContext } from "../provider";
import { useConfirmDelete } from "@/provider";
import type { UserResponse } from "../types";
import { useDeleteUser } from "../hooks/use-delete-user";

export const ListUserPage = () => {
  const navigate = useNavigate();
  const { users, filters, isLoading, isFetching, updateFilters } =
    useUserContext();
  const { deleteUser } = useDeleteUser();
  const confirmDelete = useConfirmDelete();

  const handleEdit = (user: UserResponse) => {
    navigate({ to: `/users/${user.id}/update` });
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

  const onAddUser = () => {
    navigate({ to: "/users/create" });
  };

  return (
    <div className="space-y-6">
      <TitlePage
        title="User Management"
        description="Manage all users across organizations and branches"
        isAction={true}
        actionLabel="Add User"
        onAction={onAddUser}
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
