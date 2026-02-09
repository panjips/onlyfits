import { z } from "zod";

export const planFormSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID"),
  branchIds: z.array(z.string().uuid()).optional().nullable(),
  name: z
    .string()
    .min(1, "Plan name is required")
    .max(255, "Plan name must be less than 255 characters"),
  description: z.string().optional().nullable(),
  price: z
    .number()
    .min(0, "Price is required and must be greater than or equal to 0"),
  durationDays: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration is required and must be at least 1 day"),
  isActive: z.boolean().optional(),
});

export const createPlanSchema = planFormSchema.omit({ isActive: true });

export const updatePlanSchema = planFormSchema
  .omit({ organizationId: true })
  .partial();

export type PlanFormValues = z.infer<typeof planFormSchema>;
export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;
export type UpdatePlanFormValues = z.infer<typeof updatePlanSchema>;
