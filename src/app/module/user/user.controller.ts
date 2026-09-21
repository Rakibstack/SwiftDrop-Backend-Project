/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status";
import AppError from "../../utils/AppError";
import { userService } from "./user.service";
import { requestUser } from "../../middleware/checkAuth";

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpstatus.NOT_FOUND, "File Not Found");
  }
  const userId = req.user?.userId as string;
  const result = await userService.updateUserProfile(req.file?.buffer, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpstatus.OK,
    message: "User Profile Update Successfully",
    data: result,
  });
});
const updateMerchantProfile = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.updateMerchantProfile(
      req.body,
      req.user as requestUser,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus.OK,
      message: "Merchant Profile Update Successfully",
      data: result,
    });
  },
);

export const userController = {
  updateUserProfile,
  updateMerchantProfile
};
