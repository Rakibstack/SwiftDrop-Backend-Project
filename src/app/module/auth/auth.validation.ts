import { z } from "zod";

export const merchantRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(50, "Password cannot exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters long")
    .max(150, "Business name cannot exceed 150 characters"),

  businessPhone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Please provide a valid Bangladeshi phone number"),

  businessAddress: z
    .string()
    .trim()
    .min(5, "Business address must be at least 5 characters long")
    .max(300, "Business address cannot exceed 300 characters"),
});

export type IMerchantRegisterPayload = z.infer<typeof merchantRegisterSchema>;


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

export const merchantLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(50, "Password cannot exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export type ILoginUserPayload = z.infer<typeof merchantLoginSchema>;