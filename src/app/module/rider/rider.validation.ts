import { z } from "zod";

export const applyAsRiderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  phone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please provide a valid Bangladeshi phone number",
    ),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters long")
    .max(300, "Address cannot exceed 300 characters"),

  vehicleType: z.enum(
    ["BIKE", "MOTORCYCLE"],
    "Please select a valid vehicle type",
  ),

  licenseNumber: z
    .string()
    .trim()
    .min(5, "License number must be at least 5 characters long")
    .max(50, "License number cannot exceed 50 characters"),
});
export type IApplyAsRiderPayload = z.infer<typeof applyAsRiderSchema>;



export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export type IVerifyEmailPayload = z.infer<typeof verifyEmailSchema>;

export const reviewRiderSchema = z
  .object({
    status: z.enum(["ACTIVE", "REJECTED"], {
      message: "Status must be either ACTIVE or REJECTED",
    }),
      riderId: z
      .string()
      .uuid("Invalid rider ID"),

    rejectionReason: z
      .string()
      .trim()
      .max(500, "Rejection reason cannot exceed 500 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && !data.rejectionReason) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "Rejection reason is required when rejecting a rider",
      });
    }
  });

export type IReviewRiderPayload = z.infer<typeof reviewRiderSchema>;


export const updateRiderProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please provide a valid Bangladeshi phone number",
    )
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters long")
    .max(300, "Address cannot exceed 300 characters")
    .optional(),

  vehicleType: z
    .enum(["BIKE", "MOTORCYCLE"], {
      message: "Please select a valid vehicle type",
    })
    .optional(),

  licenseNumber: z
    .string()
    .trim()
    .min(5, "License number must be at least 5 characters long")
    .max(50, "License number cannot exceed 50 characters")
    .optional(),
});

export type IUpdateRiderProfilePayload = z.infer<
  typeof updateRiderProfileSchema
>;