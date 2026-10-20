import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { analyticService } from "./analytics.service";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status";

const getAdminAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await analyticService.getAdminAnalytics();

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.OK,
      message: "Retrieve Admin Analytic Successfully",
      data: result,
    });
  },
);


export const analyticController = {
    getAdminAnalytics
}