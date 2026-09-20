/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { merchantRegisterSchema, verifyEmailSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validationRequest(merchantRegisterSchema),
  AuthController.registerMerchant,
);
router.post(
  "/verify-email",
  validationRequest(verifyEmailSchema),
  AuthController.verifyMerchantEmail,
);

export const AuthRoutes = router
