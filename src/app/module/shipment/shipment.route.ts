import { Router } from "express";
import { shipmentController } from "./shipment.controller";
import { assignRiderSchema, createShipmentSchema } from "./shipment.validation";

import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validationRequest } from "../../middleware/validationMiddleware";

const router = Router();

// merchant route
router.post(
  "/",
  validationRequest(createShipmentSchema),
  auth(UserRole.MERCHANT),
  shipmentController.createShipment,
);
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
router.get(
  "/track-shipment/:trackingId",
  auth(UserRole.MERCHANT),
  shipmentController.trackingShipment,
);
router.get(
  "/track-shipment-public/:trackingId",
  shipmentController.trackingShipmentPublic,
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
router.patch(
  "/:shipmentId/assign-rider",
  validationRequest(assignRiderSchema),
  auth(UserRole.ADMIN),
  shipmentController.assignRider,
);

export const ShipmentRouter = router;
