import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import {
  createOrganizationMutation,
  updateOrganizationMutation,
  organizationKeys,
} from "../api";
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from "../schemas";

interface UseOrganizationFormOptions {
  mode: "create" | "update";
  organizationId?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useOrganizationForm = (options: UseOrganizationFormOptions) => {
  const { mode, organizationId, redirectTo = "/organization", onSuccess } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation(createOrganizationMutation);
  const updateMutation = useMutation(
    mode === "update" && organizationId
      ? updateOrganizationMutation(organizationId)
      : createOrganizationMutation
  );

  const mutation = mode === "create" ? createMutation : updateMutation;

  const [errors, setErrors] = useState<
    Partial<Record<keyof OrganizationFormValues, string>>
  >({});

  const handleSubmit = async (values: OrganizationFormValues) => {
    try {
      setErrors({});
      organizationFormSchema.parse(values);

      const request = {
        name: values.name,
        slug: values.slug,
        logoUrl: values.logoUrl || null,
        config: values.config,
        moduleIds: values.moduleIds,
      };

      await mutation.mutateAsync(request);

      await queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });

      if (mode === "update" && organizationId) {
        queryClient.removeQueries({
          queryKey: organizationKeys.detail(organizationId),
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      navigate({ to: redirectTo });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<
          Record<keyof OrganizationFormValues, string>
        > = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof OrganizationFormValues] = e.message;
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
