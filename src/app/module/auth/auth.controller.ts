/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status";

const registerMerchant = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    await AuthService.registerMerchant(payload);

    sendResponse(res, {
      statusCode: httpstatus.CREATED,
      success: true,
      message: "Registration successful. Please verify your email.",
      data: null,
    });
  },
);
const verifyMerchantEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await AuthService.verifyMerchantEmail(payload);
    const { accessToken, refreshToken, user, merchantProfile } = result;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
      statusCode: httpstatus.CREATED,
      success: true,
      message: "Email verified successfully",
      data: {
        accessToken,
        refreshToken,
        user,
        merchantProfile,
      },
    });
  },
);
const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, } = result;

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
      statusCode: httpstatus.CREATED,
      success: true,
      message: "User Login successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  },
);

export const AuthController = {
  registerMerchant,
  verifyMerchantEmail,
  loginUser
}