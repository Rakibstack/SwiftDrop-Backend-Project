
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";

const router = Router();

router.patch(
  "/profile-image",
  auth(UserRole.ADMIN,UserRole.MERCHANT,UserRole.RIDER),
   upload.single("profileImage"),
  userController.updateUserProfile,
);

export const UserRoutes = router;
