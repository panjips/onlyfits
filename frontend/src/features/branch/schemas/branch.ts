import { z } from "zod";

export const branchFormSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  name: z
    .string()
    .min(1, "Branch name is required")
    .max(255, "Branch name must be less than 255 characters"),
  code: z
    .string()
    .max(50, "Code must be less than 50 characters")
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  phone: z
    .string()
    .max(50, "Phone must be less than 50 characters")
    .optional()
    .nullable(),
  email: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
  timezone: z
    .string()
    .max(50, "Timezone must be less than 50 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const createBranchSchema = branchFormSchema.omit({ isActive: true });

export const updateBranchSchema = branchFormSchema
  .omit({ organizationId: true })
  .partial();

export type BranchFormValues = z.infer<typeof branchFormSchema>;
export type CreateBranchFormValues = z.infer<typeof createBranchSchema>;
export type UpdateBranchFormValues = z.infer<typeof updateBranchSchema>;
