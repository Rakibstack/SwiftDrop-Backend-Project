
import { z } from "zod";

export const createShipmentSchema = z.object({
  senderName: z
    .string()
    .trim()
    .min(2, "Sender name must be at least 2 characters long")
    .max(100, "Sender name cannot exceed 100 characters"),

  senderPhone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please provide a valid Bangladeshi sender phone number",
    ),

  senderAddress: z
    .string()
    .trim()
    .min(5, "Sender address must be at least 5 characters long")
    .max(300, "Sender address cannot exceed 300 characters"),

  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name must be at least 2 characters long")
    .max(100, "Recipient name cannot exceed 100 characters"),

  recipientPhone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      "Please provide a valid Bangladeshi recipient phone number",
    ),

  recipientAddress: z
    .string()
    .trim()
    .min(5, "Recipient address must be at least 5 characters long")
    .max(300, "Recipient address cannot exceed 300 characters"),

  parcelType: z
    .string()
    .trim()
    .min(2, "Parcel type must be at least 2 characters long")
    .max(50, "Parcel type cannot exceed 50 characters"),

  parcelDescription: z
    .string()
    .trim()
    .max(500, "Parcel description cannot exceed 500 characters")
    .optional(),

  weight: z
    .number()
    .positive("Weight must be greater than 0")
    .max(100, "Weight cannot exceed 100 kg")
    .optional(),
  codAmount: z
    .number()
    .min(0, "COD amount cannot be negative")
    .default(0),
});

export type ICreateShipmentPayload = z.infer<
  typeof createShipmentSchema
>;