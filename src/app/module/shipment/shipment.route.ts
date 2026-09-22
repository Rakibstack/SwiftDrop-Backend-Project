import { Router } from "express";
import { shipmentController } from "./shipment.controller";
import { createShipmentSchema } from "./shipment.validation";

import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationMiddleware";

const router = Router();

router.post(
  "/",
  validationRequest(createShipmentSchema),
  auth(UserRole.MERCHANT),
  shipmentController.createShipment,
);

export const ShipmentRouter = router;
