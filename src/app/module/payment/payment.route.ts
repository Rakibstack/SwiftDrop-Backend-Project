import { Router } from "express";
import { paymentController } from "./payment.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { shipmentIdSchema } from "./payment.validation";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const route = Router();

route.post(
  "/initiate-shipment-payment",
  validationRequest(shipmentIdSchema),
  auth(UserRole.MERCHANT),
  paymentController.initiateShipmentPayment,
);

export const PaymentRoutes = route
