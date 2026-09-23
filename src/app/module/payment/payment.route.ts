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

// admin only routes
route.get(
  "/get-all-payment-admin",
  auth(UserRole.ADMIN),
  paymentController.getAllPaymentAdmin,
);
route.get(
  "/get-single-payment-admin/:paymentId",
  auth(UserRole.ADMIN),
  paymentController.getSinglePaymentAdmin,
);
// merchant only routes
route.get(
  "/get-all-payment-merchant",
  auth(UserRole.MERCHANT),
  paymentController.getAllPaymentMerchan,
);
route.get(
  "/get-single-payment-merchant/:paymentId",
  auth(UserRole.MERCHANT),
  paymentController.getSinglePaymentMerchant,
);


export const PaymentRoutes = route
