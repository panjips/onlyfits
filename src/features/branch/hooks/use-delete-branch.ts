import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteBranchMutation,
  branchKeys,
} from "../api";

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteBranchMutation);

  const handleDelete = async (id: string, onSuccess?: () => void) => {
    try {
      await mutation.mutateAsync(id);

      // Invalidate and refetch branch list
      await queryClient.invalidateQueries({
        queryKey: branchKeys.lists(),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error handling is done in the mutation onError callback
      console.error("Failed to delete branch:", err);
    }
  };

  const confirmDelete = (id: string, name: string, onSuccess?: () => void) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    );

    if (confirmed) {
      handleDelete(id, onSuccess);
    }
  };

  return {
    handleDelete,
    confirmDelete,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
};
