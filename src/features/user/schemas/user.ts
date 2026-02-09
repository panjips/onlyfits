import { z } from "zod";

export const userRoleSchema = z.enum([
  "super_admin",
  "admin",
  "staff",
  "member",
]);

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: userRoleSchema.optional(),
  organizationId: z.string().uuid("Invalid organization ID").optional(),
  branchId: z.string().uuid("Invalid branch ID").optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const userFilterSchema = z.object({
  organizationId: z.string().optional(),
  branchId: z.string().optional(),
  role: userRoleSchema.optional().or(z.literal("")),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type UserFilterValues = z.infer<typeof userFilterSchema>;
