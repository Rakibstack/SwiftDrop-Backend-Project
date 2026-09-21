import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { riderService } from "./rider.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { requestUser } from "../../middleware/checkAuth";

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
const approveRider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user;
    const result = await riderService.approveRider(
      payload,
      user as requestUser,
    );

    const message =
      result.status  === "ACTIVE"
        ? "Rider application approved successfully"
        : "Rider application rejected successfully";

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message,
      data: result,
    });
  },
);

const getAllRiders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await riderService.getAllRiders(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Retrieve All Riders successfully",
      data: result,
    });
  },
);
const getSingleRider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const riderId = req.params.riderId as string
    const result = await riderService.getSingleRider(riderId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get Single Rider successfully",
      data: result,
    });
  },
);
const updateRiderProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user;
    const result = await riderService.updateRiderProfile(
      payload,
      user as requestUser,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Update Rider Profile successfully",
      data: result,
    });
  },
);

export const riderController = {
  applyAsRider,
  verifyRiderEmail,
  approveRider,
  getAllRiders,
  getSingleRider,
  updateRiderProfile,
};
