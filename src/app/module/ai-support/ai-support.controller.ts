import { Request, Response } from "express";
import httpstatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { aiSupportService } from "./ai-support.service";
import { requestUser } from "../../middleware/checkAuth";

const askAIQuestion = catchAsync(async (req: Request, res: Response) => {
  const answer = await aiSupportService.askAIQuestion({
    input: req.body,
    user: req.user as requestUser,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpstatus.OK,
    message: "AI support response generated successfully",
    data: { answer },
  });
});

export const aiSupportController = { askAIQuestion };
