import { z } from "zod";

// Unified schema for both create and update module
export const moduleFormSchema = z.object({
  key: z
    .string()
    .min(1, "Module key is required")
    .max(50, "Module key must be less than 50 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Key must contain only lowercase letters, numbers, and underscores",
    ),
  name: z
    .string()
    .min(1, "Module name is required")
    .max(100, "Module name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;

// Keep backward compatibility exports
export const createModuleSchema = moduleFormSchema;
export const updateModuleSchema = moduleFormSchema.partial();

export type CreateModuleFormValues = z.infer<typeof createModuleSchema>;
export type UpdateModuleFormValues = z.infer<typeof updateModuleSchema>;
