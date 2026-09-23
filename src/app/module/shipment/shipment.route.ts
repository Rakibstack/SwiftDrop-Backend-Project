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
// admin route
router.get(
  "/get-all-shipment-admin",
  auth(UserRole.ADMIN),
  shipmentController.getAllShipmentAdmin,
);
router.get(
  "/get-single-shipment-admin/:shipmentId",
  auth(UserRole.ADMIN),
  shipmentController.getSingleShipmentAdmin,
);
// merchant route
router.get(
  "/get-all-shipment-merchant",
  auth(UserRole.MERCHANT),
  shipmentController.getAllShipment,
);
router.get(
  "/get-single-shipment-merchant/:shipmentId",
  auth(UserRole.MERCHANT),
  shipmentController.getSingleShipment,
);

export const ShipmentRouter = router;
