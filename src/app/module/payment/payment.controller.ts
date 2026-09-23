import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";
import type { requestUser } from "../../middleware/checkAuth";

const initiateShipmentPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user as requestUser;
    const result = await paymentService.initiateShipmentPayment(payload, user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "initiate Shipment Payment successfully",
      data: result,
    });
  },
);
const initiateShipmentPaymentCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { redirectUrl } =
      await paymentService.initiateShipmentPaymentCallback(req.query);

    res.redirect(redirectUrl as string);
  },
);
const cancelShipment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.cancelShipment(
    req.params.shipmentId as string,
    req.body,
    req.user as requestUser,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Shipment cancelled successfully.",
    data: result,
  });
});


const getAllPaymentMerchan = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.getAllPaymentMerchant(
      req.query,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Retrieved All Payment History Successfully",
      data: result,
    });
  },
);
const getSinglePaymentMerchant = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.getSinglePaymentMerchant(
      req.params.paymentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment Retrieved Successfully",
      data: result,
    });
  },
);

const getAllPaymentAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.getAllPaymentsAdmin(
      req.query,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Retrieved All Payment History Successfully",
      data: result,
    });
  },
);
const getSinglePaymentAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.getSinglePaymentAdmin(
      req.params.paymentId as string,
      req.user as requestUser,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment Retrieved Successfully",
      data: result,
    });
  },
);

export const paymentController = {
  initiateShipmentPayment,
  initiateShipmentPaymentCallback,
  cancelShipment,
  getAllPaymentAdmin,
  getSinglePaymentAdmin,
  getAllPaymentMerchan,
  getSinglePaymentMerchant
};
