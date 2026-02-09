import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { createModuleMutation, moduleKeys } from "../api";
import {
  createModuleSchema,
  type CreateModuleFormValues,
} from "../schemas/module";

interface UseCreateModuleFormOptions {
  redirectTo?: string;
}

export const useCreateModuleForm = (
  options: UseCreateModuleFormOptions = {},
) => {
  const { redirectTo = "/organization/modules" } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(createModuleMutation);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateModuleFormValues, string>>
  >({});

  const handleCreate = async (values: CreateModuleFormValues) => {
    try {
      setErrors({});
      createModuleSchema.parse(values);

      await mutation.mutateAsync({
        key: values.key,
        name: values.name,
        description: values.description,
      });

      // Invalidate and refetch module list
      await queryClient.invalidateQueries({
        queryKey: moduleKeys.lists(),
      });

      // Navigate after success
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof CreateModuleFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof CreateModuleFormValues] = e.message;
          }
        }
        setErrors(fieldErrors);
      }
    }
  };

  return {
    handleCreate,
    isLoading: mutation.isPending,
    errors,
  };
};
