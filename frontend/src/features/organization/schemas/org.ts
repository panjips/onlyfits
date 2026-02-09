import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  logoUrl: z.string().url("Invalid URL format").optional().nullable().or(z.literal("")),
  config: z.record(z.string(), z.unknown()).optional(),
  moduleIds: z.array(z.string()).optional().default([]),
});

export const createOrganizationSchema = organizationFormSchema;
export const updateOrganizationSchema = organizationFormSchema.partial().extend({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be less than 100 characters")
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;