import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { riderService } from "./rider.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const applyAsRider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await riderService.applyAsRider(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:
        "Rider application submitted successfully. Please verify your email and wait for admin approval.",
      data: result,
    });
  },
);
const verifyRiderEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await riderService.verifyRiderEmail(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Rider email verified successfully",
      data: result,
    });
  },
);

export const riderController = {
  applyAsRider,
  verifyRiderEmail,
};
