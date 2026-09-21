import { Router } from "express";
import { validationRequest } from "../../middleware/validationMiddleware";
import { applyAsRiderSchema, verifyEmailSchema } from "./rider.validation";
import { riderController } from "./rider.controller";

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


export const RiderRoutes = router;
