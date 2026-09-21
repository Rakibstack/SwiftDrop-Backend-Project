
import z from "zod"

export const updateMerchantProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters long")
    .max(150, "Business name cannot exceed 150 characters")
    .optional(),

  businessPhone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please provide a valid Bangladeshi phone number",
    )
    .optional(),

  businessAddress: z
    .string()
    .trim()
    .min(5, "Business address must be at least 5 characters long")
    .max(300, "Business address cannot exceed 300 characters")
    .optional(),
});

export type IUpdateMerchantProfilePayload = z.infer<
  typeof updateMerchantProfileSchema
>;