import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { forgotPasswordSchema, merchantLoginSchema, merchantRegisterSchema, resetPasswordSchema, verifyEmailSchema } from "./auth.validation";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

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
router.get(
  "/me",
  auth(UserRole.MERCHANT,UserRole.RIDER,UserRole.ADMIN),
  AuthController.getMe,
);
router.post(
  "/refresh-token",
  AuthController.refreshToken,
);
router.post(
  "/forgot-password",
  validationRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validationRequest(resetPasswordSchema),
  AuthController.resetPassword,
);
router.post(
  "/google",
  AuthController.googleLogin,
);

export const AuthRoutes = router
