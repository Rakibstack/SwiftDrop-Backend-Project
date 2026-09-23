/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { validationRequest } from "../../middleware/validationMiddleware";
import { applyAsRiderSchema, reviewRiderSchema, riderShipmentQuerySchema, updateRiderProfileSchema, verifyEmailSchema } from "./rider.validation";
import { riderController } from "./rider.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/apply-as-rider",
  validationRequest(applyAsRiderSchema),
  riderController.applyAsRider,
);
router.post(
  "/verify-rider-email",
  validationRequest(verifyEmailSchema),
  riderController.verifyRiderEmail,
);
router.post(
  "/approve-rider",
  auth(UserRole.ADMIN),
  validationRequest(reviewRiderSchema),
  riderController.approveRider,
);
router.get(
  "/get-all-riders",
  auth(UserRole.ADMIN),
  riderController.getAllRiders,
);

router.patch(
  "/update-rider-profile",
  auth(UserRole.RIDER),
  validationRequest(updateRiderProfileSchema),
  riderController.updateRiderProfile,
);
router.get(
  "/my-shipments",
  auth(UserRole.RIDER),
  riderController.getMyAssignedShipments,
);
router.get(
  "/:riderId",
  auth(UserRole.ADMIN),
  riderController.getSingleRider,
);



export const RiderRoutes = router;
