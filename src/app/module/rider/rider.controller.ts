import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { riderService } from "./rider.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import type { requestUser } from "../../middleware/checkAuth";

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
const getMyAssignedShipments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.getMyAssignedShipments(
      req.query,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Assigned Shipments Retrieved Successfully",
      data: result,
    });
  },
);
const acceptShipment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.acceptShipment(
      req.params.shipmentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipment Accepted Successfully",
      data: result,
    });
  },
);
const pickupShipment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.pickupShipment(
      req.params.shipmentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipment Picked Up Successfully",
      data: result,
    });
  },
);
const markInTransit = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.markInTransit(
      req.params.shipmentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipment Transit Up Successfully",
      data: result,
    });
  },
);
const outForDelivery = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.outForDelivery(
      req.params.shipmentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipment Out For Delivery Successfully",
      data: result,
    });
  },
);
const deliverShipment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderService.deliverShipment(
      req.params.shipmentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shipment  Delivery Successfully",
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
  getMyAssignedShipments,
  acceptShipment,pickupShipment,
  markInTransit,outForDelivery,
  deliverShipment
};
