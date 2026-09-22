import { PaymentStatus, ShipmentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { requestUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import { IShipmentIdPayload } from "./payment.validation";

const initiateShipmentPayment = async (payload: IShipmentIdPayload, user: requestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true,
    },
  });
  if (!isUserExist) {
    throw new AppError(httpstatus.NOT_FOUND, "User Not Found");
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpstatus.FORBIDDEN, "This account has been deleted");
  }

  if (isUserExist.status === "SUSPENDED") {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "This account is suspended. Please contact support.",
    );
  }
  if (!isUserExist.merchantProfile) {
    throw new AppError(httpstatus.NOT_FOUND, "Merchant Profile Not Found");
  }

  const isShipmentExist = await prisma.shipment.findUnique({
    where: { id: payload.shipmentId, merchantId: isUserExist.merchantProfile.id },
    include: {
      payments: true,
    },
  });

  if (!isShipmentExist) {
    throw new AppError(httpstatus.NOT_FOUND, "Shipment Not Found");
  }
  if (isShipmentExist.status !== ShipmentStatus.PAYMENT_PENDING) {
    throw new AppError(
      httpstatus.CONFLICT,
      `This Shipment Already Has Been ${isShipmentExist.status}`,
    );
  }
  const PAYMENT_EXPIRY_MINUTES = 10;
  const pendingPayment = isShipmentExist.payments.find(
    (payment) => payment.status === PaymentStatus.PENDING,
  );

  if (pendingPayment) {
    const expiryTime = new Date(
      pendingPayment.createdAt.getTime() + PAYMENT_EXPIRY_MINUTES * 60 * 1000,
    );

    if (new Date() >= expiryTime) {
      await prisma.payment.update({
        where: {
          id: pendingPayment.id,
        },
        data: {
          status: PaymentStatus.EXPIRED,
        },
      });
    } else {
      throw new AppError(
        httpstatus.CONFLICT,
        "A payment is already pending for this shipment.",
      );
    }
  }

  const amount = Number(isShipmentExist.deliveryFee);

  const bkashIdToken = await getBkashIdToken();
  if (!bkashIdToken) {
    throw new AppError(httpstatus.BAD_REQUEST, "Bkash Access Token Not Found.");
  }

  const createBkashPaymentResponse = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: user.email, // email or phone number
        callbackURL: `${config.bkash_callback_url}/shipment/payment/callback`,
        amount: amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: isShipmentExist.id,
      }),
    },
  );
  if (!createBkashPaymentResponse.ok) {
    throw new AppError(
      httpstatus.BAD_GATEWAY,
      "Failed to create bKash payment",
    );
  }
  const createBkashPaymentResult = await createBkashPaymentResponse.json();
  const merchantInvoiceNumber = `SWD-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
  await prisma.payment.create({
    data: {
      shipmentId: isShipmentExist.id,
      amount,
      status: PaymentStatus.PENDING,
      merchantInvoiceNumber: merchantInvoiceNumber,
      bkashPaymentId: createBkashPaymentResult.paymentID,
      payerReference: user.email,
      gatewayResponse: createBkashPaymentResult,
    },
  });

  return {
    paymentURL: createBkashPaymentResult.bkashURL,
  };
};

export const paymentService = {

    initiateShipmentPayment
}
