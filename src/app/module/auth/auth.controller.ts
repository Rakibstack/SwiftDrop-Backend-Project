/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpstatus from "http-status";
import AppError from "../../utils/AppError";

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
    const { accessToken, refreshToken } = result;

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

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      httpstatus.BAD_REQUEST,
      "User information is missing in the request",
    );
  }

  const result = await AuthService.getMe(user);
  sendResponse(res, {
    statusCode: httpstatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {

  if (!req.cookies.refreshToken) {
    throw new AppError(httpstatus.BAD_REQUEST, "Refresh token is missing");
  }
  const result = await AuthService.refreshToken(req.cookies.refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpstatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    await AuthService.forgotPassword(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.OK,
      message: `OTP Send To Email : ${payload.email}`,
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    await AuthService.resetPassword(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.OK,
      message: "Password Change  Successfull",
      data: null,
    });
  },
);
const googleLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await AuthService.googleLogin(payload);
    const { accessToken, refreshToken } = result;

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
      success: true,
      statusCode: httpstatus.OK,
      message: "Google Login Successfull",
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
  loginUser,getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin
};
