import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { moduleKeys, updateModuleMutation } from "../api";
import {
  updateModuleSchema,
  type UpdateModuleFormValues,
} from "../schemas/module";

interface UseUpdateModuleFormOptions {
  moduleId: string;
  redirectTo?: string;
}

export const useUpdateModuleForm = (options: UseUpdateModuleFormOptions) => {
  const { moduleId, redirectTo = "/organization/modules" } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(updateModuleMutation(moduleId));
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateModuleFormValues, string>>
  >({});

  const handleUpdate = async (values: UpdateModuleFormValues) => {
    try {
      setErrors({});
      updateModuleSchema.parse(values);

      await mutation.mutateAsync({
        key: values.key,
        name: values.name,
        description: values.description,
      });

      // Invalidate and refetch module list and detail
      await queryClient.invalidateQueries({
        queryKey: moduleKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: moduleKeys.detail(moduleId),
      });

      // Navigate after success
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof UpdateModuleFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof UpdateModuleFormValues] = e.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
  };

  return {
    handleUpdate,
    isLoading: mutation.isPending,
    errors,
  };
};
