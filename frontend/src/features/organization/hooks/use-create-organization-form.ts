import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import {
  createOrganizationMutation,
  organizationKeys,
} from "../api";
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from "../schemas";

interface UseCreateOrganizationFormOptions {
  redirectTo?: string;
}

export const useCreateOrganizationForm = (
  options: UseCreateOrganizationFormOptions = {},
) => {
  const { redirectTo = "/dashboard" } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(createOrganizationMutation);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateOrganizationFormValues, string>>
  >({});

  const handleCreate = async (values: CreateOrganizationFormValues) => {
    try {
      setErrors({});
      createOrganizationSchema.parse(values);

      await mutation.mutateAsync({
        name: values.name,
        slug: values.slug,
        logoUrl: values.logoUrl,
        config: values.config,
        moduleIds: values.moduleIds,
      });

      // Invalidate and refetch organization list
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });

      // Navigate after success
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof CreateOrganizationFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof CreateOrganizationFormValues] =
              e.message;
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
