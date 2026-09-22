import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"
import { paymentService } from "./payment.service";
import { requestUser } from "../../middleware/checkAuth";

const initiateShipmentPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body
    const user = req.user as requestUser
    const result = await paymentService.initiateShipmentPayment(payload,user)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "initiate Shipment Payment successfully",
      data: result,
    });
  },
);

export const paymentController = {
    initiateShipmentPayment
}