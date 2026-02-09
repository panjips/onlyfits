import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { useConfirmSave } from "@/provider";
import { createPlanMutation, updatePlanMutation, planKeys } from "../api";
import {
  createPlanSchema,
  updatePlanSchema,
  type PlanFormValues,
} from "../schemas";

interface UsePlanFormOptions {
  mode: "create" | "update";
  planId?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export const usePlanForm = (options: UsePlanFormOptions) => {
  const { mode, planId, redirectTo = "/billing/plans", onSuccess } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirmSave = useConfirmSave();

  const createMutation = useMutation(createPlanMutation);
  const updateMutation = useMutation(
    mode === "update" && planId
      ? updatePlanMutation(planId)
      : createPlanMutation
  );

  const mutation = mode === "create" ? createMutation : updateMutation;

  const [errors, setErrors] = useState<
    Partial<Record<keyof PlanFormValues, string>>
  >({});

  const handleSubmit = async (values: PlanFormValues) => {
    try {
      setErrors({});

      // Use appropriate schema based on mode
      if (mode === "create") {
        createPlanSchema.parse(values);
      } else {
        updatePlanSchema.parse(values);
      }

      // Show confirmation dialog
      const confirmed = await confirmSave(values.name, async () => {
        const request = {
          organizationId: values.organizationId,
          branchIds: values.branchIds || [],
          name: values.name,
          description: values.description || null,
          price: values.price,
          durationDays: values.durationDays,
          isActive: values.isActive,
        };

        await mutation.mutateAsync(request);

        await queryClient.invalidateQueries({
          queryKey: planKeys.lists(),
        });

        if (mode === "update" && planId) {
          queryClient.removeQueries({
            queryKey: planKeys.detail(planId),
          });
        }

        if (onSuccess) {
          onSuccess();
        }
        navigate({ to: redirectTo });
      });

      return confirmed;
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof PlanFormValues, string>> = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof PlanFormValues] = e.message;
          }
        }
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return {
    handleSubmit,
    isLoading: mutation.isPending,
    errors,
    mode,
  };
};
