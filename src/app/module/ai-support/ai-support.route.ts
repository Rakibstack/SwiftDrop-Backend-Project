import { Router } from "express";
import { aiSupportController } from "./ai-support.controller";
import { validationRequest } from "../../middleware/validationMiddleware";
import { askAIQuestionSchema } from "./ai-support.validation";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/ask",
  validationRequest(askAIQuestionSchema),
  auth(UserRole.MERCHANT),
  aiSupportController.askAIQuestion,
);

 export const aiSupportRouter = router;