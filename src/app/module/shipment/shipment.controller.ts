
import { Request, Response } from "express";
import httpstatus from "http-status";
import { shipmentService } from "./shipment.service";
import { requestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";



const createShipment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await shipmentService.createShipment(
      req.body,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.CREATED,
      message: "Shipment Created Successfully",
      data: result,
    });
  },
);
const getAllShipment = catchAsync(
  async (req: Request, res: Response) => {

    const result = await shipmentService.getAllShipment(
      req.query,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.CREATED,
      message: "Retrieve All Shipment Successfully",
      data: result,
    });
  },
);
const getSingleShipment = catchAsync(
  async (req: Request, res: Response) => {

    const shipmentId = req.params.shipmentId as string;
    const result = await shipmentService.getSingleShipment(
      shipmentId,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpstatus.CREATED,
      message: "Retrieve Single Shipment Successfully",
      data: result,
    });
  },
);

export const shipmentController = {
  createShipment,
  getAllShipment,
  getSingleShipment
};