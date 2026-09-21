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