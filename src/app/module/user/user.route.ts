
import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { validationRequest } from "../../middleware/validationMiddleware";
import { updateMerchantProfileSchema } from "./user.validation";

const router = Router();

router.patch(
  "/profile-image",
  auth(UserRole.ADMIN,UserRole.MERCHANT,UserRole.RIDER),
   upload.single("profileImage"),
  userController.updateUserProfile,
);
router.patch(
  "/merchant-profile",
  validationRequest(updateMerchantProfileSchema),
  auth(UserRole.MERCHANT),
  userController.updateMerchantProfile,
);
router.get(
  "/get-all-users",
  auth(UserRole.ADMIN),
  userController.getAllUsers,
);
router.get(
  "/get-single-user/:userId",
  auth(UserRole.ADMIN),
  userController.getSingleUser,
);
router.patch(
  "/delete-user/:userId",
  auth(UserRole.ADMIN),
  userController.deleteUser,
);


export const UserRoutes = router;
