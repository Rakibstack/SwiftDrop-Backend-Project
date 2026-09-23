import { z } from "zod";

export const shipmentIdSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

export type IShipmentIdPayload = z.infer<typeof shipmentIdSchema>;

export const cancelShipmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Cancellation reason must be at least 5 characters long")
    .max(500, "Cancellation reason cannot exceed 500 characters"),
});
export type ICancelShipmentPayload = z.infer<typeof cancelShipmentSchema>;
