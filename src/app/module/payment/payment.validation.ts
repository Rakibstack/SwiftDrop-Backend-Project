
import { z } from "zod";

export const shipmentIdSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

export type IShipmentIdPayload = z.infer<typeof shipmentIdSchema>;