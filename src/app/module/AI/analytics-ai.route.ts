import { Router } from "express";
import { analyticsAIController } from "./analytics-ai.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();
router.get(
  "/admin-ai-insights",
  auth(UserRole.ADMIN),
  analyticsAIController.getAdminAIInsights,
);


 export const adminAnalytic = router; 
