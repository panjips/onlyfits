import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ZodError } from "zod";
import { useConfirmSave } from "@/provider";
import { createMemberMutation, updateMemberMutation, memberKeys } from "../api";
import {
  createMemberSchema,
  updateMemberSchema,
  type MemberFormValues,
} from "../schemas";

interface UseMemberFormOptions {
  mode: "create" | "update";
  memberId?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useMemberForm = (options: UseMemberFormOptions) => {
  const { mode, memberId, redirectTo = "/members", onSuccess } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirmSave = useConfirmSave();

  const createMutation = useMutation(createMemberMutation);
  const updateMutation = useMutation(updateMemberMutation(memberId || ""));

  const mutation = mode === "create" ? createMutation : updateMutation;

  const [errors, setErrors] = useState<
    Partial<Record<keyof MemberFormValues, string>>
  >({});

  const handleSubmit = async (values: MemberFormValues) => {
    try {
      setErrors({});

      // Use appropriate schema based on mode
      if (mode === "create") {
        createMemberSchema.parse(values);
      } else {
        updateMemberSchema.parse(values);
      }

      // Show confirmation dialog
      const fullName = `${values.firstName} ${values.lastName}`;
      const confirmed = await confirmSave(fullName, async () => {
        if (mode === "create") {
          const request = {
            email: values.email || null,
            organizationId: values.organizationId,
            homeBranchId: values.homeBranchId || null,
            planId: values.planId || null,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || null,
            dateOfBirth: values.dateOfBirth || null,
            status: values.status || null,
            joinDate: values.joinDate || null,
            notes: values.notes || null,
          };

          await createMutation.mutateAsync(request);
        } else {
          const request = {
            userId: null,
            homeBranchId: values.homeBranchId || null,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || null,
            dateOfBirth: values.dateOfBirth || null,
            status: values.status || null,
            joinDate: values.joinDate || null,
            notes: values.notes || null,
          };

          await updateMutation.mutateAsync(request);
        }

        await queryClient.invalidateQueries({
          queryKey: memberKeys.lists(),
        });

        if (mode === "update" && memberId) {
          queryClient.removeQueries({
            queryKey: memberKeys.detail(memberId),
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
        const fieldErrors: Partial<Record<keyof MemberFormValues, string>> = {};
        for (const e of err.issues) {
          if (e.path[0]) {
            fieldErrors[e.path[0] as keyof MemberFormValues] = e.message;
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
