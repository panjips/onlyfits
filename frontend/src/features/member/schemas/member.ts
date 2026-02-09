import { z } from "zod";

export const memberFormSchema = z.object({
  email: z.string().email("Invalid email address").optional().nullable(),
  organizationId: z.string().uuid("Invalid organization ID"),
  homeBranchId: z.string().uuid("Invalid branch ID").optional().nullable(),
  planId: z.string().uuid("Invalid plan ID").optional().nullable(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createMemberSchema = memberFormSchema.extend({
  organizationId: z.string().uuid("Organization is required"),
  homeBranchId: z.string().uuid("Home branch is required"),
  planId: z.string().uuid("Plan is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  joinDate: z.string().min(1, "Join date is required"),
});

export const updateMemberSchema = memberFormSchema
  .omit({ organizationId: true, email: true, planId: true })
  .partial();

export type MemberFormValues = z.infer<typeof memberFormSchema>;
export type CreateMemberFormValues = z.infer<typeof createMemberSchema>;
export type UpdateMemberFormValues = z.infer<typeof updateMemberSchema>;
