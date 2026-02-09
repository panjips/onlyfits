import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createUserMutation, updateUserMutation, userKeys } from "../api";
import type { CreateUserRequest, UpdateUserRequest } from "../types";

export interface UseUserFormOptions {
  mode: "create" | "update";
  userId?: string;
  redirectTo?: string;
}

export const useUserForm = ({
  mode,
  userId,
  redirectTo = "/users",
}: UseUserFormOptions) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...createUserMutation,
    onSuccess: (data) => {
      createUserMutation.onSuccess(data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      navigate({ to: redirectTo });
    },
  });

  const updateMutation = useMutation({
    ...updateUserMutation(userId || ""),
    onSuccess: (data) => {
      updateUserMutation(userId || "").onSuccess(data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(userId || ""),
      });
      navigate({ to: redirectTo });
    },
  });

  const handleSubmit = useCallback(
    async (data: CreateUserRequest | UpdateUserRequest) => {
      if (mode === "create") {
        return createMutation.mutateAsync(data as CreateUserRequest);
      } else {
        return updateMutation.mutateAsync(data as UpdateUserRequest);
      }
    },
    [mode, createMutation, updateMutation]
  );

  return {
    handleSubmit,
    isLoading: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
  };
};
