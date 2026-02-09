import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import {
  createBranchMutation,
  updateBranchMutation,
  branchKeys,
} from "../api";
import {
  createBranchSchema,
  updateBranchSchema,
  type BranchFormValues,
} from "../schemas";

interface UseBranchFormOptions {
  mode: "create" | "update";
  branchId?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useBranchForm = (options: UseBranchFormOptions) => {
  const { mode, branchId, redirectTo = "/branches", onSuccess } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation(createBranchMutation);
  const updateMutation = useMutation(
    mode === "update" && branchId
      ? updateBranchMutation(branchId)
      : createBranchMutation
  );

  const mutation = mode === "create" ? createMutation : updateMutation;

  const [errors, setErrors] = useState<
    Partial<Record<keyof BranchFormValues, string>>
  >({});

  const handleSubmit = async (values: BranchFormValues) => {
    try {
      setErrors({});
      
      // Use appropriate schema based on mode
      if (mode === "create") {
        createBranchSchema.parse(values);
      } else {
        updateBranchSchema.parse(values);
      }

      const request = {
        organizationId: values.organizationId,
        name: values.name,
        code: values.code || null,
        address: values.address || null,
        phone: values.phone || null,
        email: values.email || null,
        timezone: values.timezone || null,
        isActive: values.isActive,
      };

      await mutation.mutateAsync(request);

      await queryClient.invalidateQueries({
        queryKey: branchKeys.lists(),
      });

      if (mode === "update" && branchId) {
        queryClient.removeQueries({
          queryKey: branchKeys.detail(branchId),
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof BranchFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof BranchFormValues] = e.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
  };

  return {
    handleSubmit,
    isLoading: mutation.isPending,
    errors,
    mode,
  };
};
