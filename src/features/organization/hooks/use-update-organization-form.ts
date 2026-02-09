import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import {
  updateOrganizationMutation,
  organizationKeys,
} from "../api";
import {
  updateOrganizationSchema,
  type UpdateOrganizationFormValues,
} from "../schemas";

interface UseUpdateOrganizationFormOptions {
  organizationId: string;
  redirectTo?: string;
}

export const useUpdateOrganizationForm = (
  options: UseUpdateOrganizationFormOptions,
) => {
  const { organizationId, redirectTo = "/dashboard" } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(updateOrganizationMutation(organizationId));
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateOrganizationFormValues, string>>
  >({});

  const handleUpdate = async (values: UpdateOrganizationFormValues) => {
    try {
      setErrors({});
      updateOrganizationSchema.parse(values);

      await mutation.mutateAsync({
        name: values.name,
        slug: values.slug,
        logoUrl: values.logoUrl,
        config: values.config,
        moduleIds: values.moduleIds,
      });

      // Invalidate and refetch organization data
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(organizationId),
      });

      // Navigate after success
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof UpdateOrganizationFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof UpdateOrganizationFormValues] =
              e.message;
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
