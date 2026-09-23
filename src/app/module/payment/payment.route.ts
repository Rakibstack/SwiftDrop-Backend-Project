import { Router } from "express";
import { paymentController } from "./payment.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { cancelShipmentSchema, shipmentIdSchema } from "./payment.validation";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const route = Router();

route.post(
  "/initiate-shipment-payment",
  validationRequest(shipmentIdSchema),
  auth(UserRole.MERCHANT),
  paymentController.initiateShipmentPayment,
);
route.get(
  "/bkash/payment/callback",
  paymentController.initiateShipmentPaymentCallback,
);
route.post(
  "/cancel-shipment/:shipmentId",
  validationRequest(cancelShipmentSchema),
  auth(UserRole.MERCHANT),
  paymentController.cancelShipment,
);

export const PaymentRoutes = route
