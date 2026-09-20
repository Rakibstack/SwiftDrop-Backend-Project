/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { merchantLoginSchema, merchantRegisterSchema, verifyEmailSchema } from "./auth.validation";

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
router.post(
  "/login",
  validationRequest(merchantLoginSchema),
  AuthController.loginUser,
);

export const AuthRoutes = router
