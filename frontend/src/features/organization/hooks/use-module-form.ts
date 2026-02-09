import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import {
  createModuleMutation,
  updateModuleMutation,
  moduleKeys,
} from "../api";
import {
  moduleFormSchema,
  type ModuleFormValues,
} from "../schemas";

interface UseModuleFormOptions {
  mode: "create" | "update";
  moduleId?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useModuleForm = (options: UseModuleFormOptions) => {
  const { mode, moduleId, redirectTo = "/organization/modules", onSuccess } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation(createModuleMutation);
  const updateMutation = useMutation(
    mode === "update" && moduleId
      ? updateModuleMutation(moduleId)
      : createModuleMutation
  );

  const mutation = mode === "create" ? createMutation : updateMutation;

  const [errors, setErrors] = useState<
    Partial<Record<keyof ModuleFormValues, string>>
  >({});

  const handleSubmit = async (values: ModuleFormValues) => {
    try {
      setErrors({});
      moduleFormSchema.parse(values);

      const request = {
        key: values.key,
        name: values.name,
        description: values.description || undefined,
      };

      await mutation.mutateAsync(request);

      await queryClient.invalidateQueries({
        queryKey: moduleKeys.lists(),
      });

      if (mode === "update" && moduleId) {
        queryClient.removeQueries({
          queryKey: moduleKeys.detail(moduleId),
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof ModuleFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof ModuleFormValues] = e.message;
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
