
import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { analyticsAIService } from "./analytics-ai.service";

const getAdminAIInsights = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await analyticsAIService.generateAdminAIInsights();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "AI Logistics Insights generated successfully",
      data: result,
    });
  },
);

export const analyticsAIController = {
  getAdminAIInsights,
};