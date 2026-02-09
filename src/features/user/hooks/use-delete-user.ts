import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserMutation, userKeys } from "../api";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...deleteUserMutation,
    onSuccess: (data) => {
      deleteUserMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};
