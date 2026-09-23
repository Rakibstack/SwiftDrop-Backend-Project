import { PaymentStatus, ShipmentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import type { requestUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import type {
  ICancelShipmentPayload,
  IShipmentIdPayload,
} from "./payment.validation";
import transporter from "../../lib/nodemailer";
import path from "path";
import ejs from "ejs";

const initiateShipmentPayment = async (
  payload: IShipmentIdPayload,
  user: requestUser,
) => {
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
    where: {
      id: payload.shipmentId,
      merchantId: isUserExist.merchantProfile.id,
    },
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
        "A payment is already pending for this shipment. Try 10 minute later",
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
        callbackURL: `${config.bkash_callback_url}/payment/bkash/payment/callback`,
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

const initiateShipmentPaymentCallback = async (query: Record<string, any>) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const paymentId = query.paymentID;
      if (!paymentId) {
        throw new AppError(httpstatus.NOT_FOUND, "payment is Not Found");
      }
      const status = query.status;
      if (!status) {
        throw new AppError(httpstatus.BAD_REQUEST, "Status Is Missing");
      }

      const bkashIdToken = await getBkashIdToken();
      if (!bkashIdToken) {
        throw new AppError(
          httpstatus.BAD_REQUEST,
          "Bkash Access Token Not Found.",
        );
      }

      const executePaymentResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config.bkash_app_key,
          },
          body: JSON.stringify({
            paymentID: paymentId,
          }),
        },
      );
      if (!executePaymentResponse.ok) {
        throw new AppError(
          httpstatus.INTERNAL_SERVER_ERROR,
          "Bkash Execute Payment Failed",
        );
      }
      const executePaymentResult = await executePaymentResponse.json();

      if (status === "success") {
        const payment = await prisma.payment.findUnique({
          where: {
            bkashPaymentId: paymentId,
          },
        });

        if (!payment) {
          throw new AppError(httpstatus.NOT_FOUND, "Payment Not Found");
        }

        if (payment.status === PaymentStatus.PAID) {
          return {
            message: "Payment Already Completed",
          };
        }
        await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: PaymentStatus.PAID,
            bkashTrxId: executePaymentResult.trxID,
            paidAt: new Date(),
            gatewayResponse: executePaymentResult,
          },
        });

        const updatedShipment = await tx.shipment.update({
          where: {
            id: payment.shipmentId,
          },
          include: {
            merchant: {
              include: {
                user: true,
              },
            },
          },
          data: {
            status: ShipmentStatus.PAYMENT_CONFIRMED,
          },
        });

        await tx.trackingEvent.create({
          data: {
            shipmentId: payment.shipmentId,
            status: ShipmentStatus.PAYMENT_CONFIRMED,
            description: "Shipment payment confirmed successfully.",
          },
        });

        await tx.auditLog.create({
          data: {
            userId: updatedShipment.merchant.userId,
            action: "PAYMENT_COMPLETED",
            entity: "SHIPMENT",
            entityId: payment.shipmentId,
            metadata: {
              paymentId: payment.id,
              bkashPaymentId: paymentId,
              bkashTrxId: executePaymentResult.trxID,
            },
          },
        });
        const templatePath = path.join(
          process.cwd(),
          "src/app/template/ShipmentPaymentConfirmed.ejs",
        );

        const html = await ejs.renderFile(templatePath, {
          merchantName: updatedShipment.merchant.user.name,
          trackingId: updatedShipment.trackingId,
          recipientName: updatedShipment.recipientName,
          deliveryFee: updatedShipment.deliveryFee.toString(),
        });

        await transporter.sendMail({
          from: config.sender_email,
          to: updatedShipment.merchant.user.email,
          subject: "Shipment Confirmed Successfully",
          html,
        });
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-shipments?status=success`,
        };
      } else if (status === "failure") {
        await tx.payment.update({
          where: {
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: executePaymentResult,
          },
        });
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-shipments?status=false`,
        };
      } else if (status === "cancel") {
        await tx.payment.update({
          where: {
            bkashPaymentId: paymentId,
          },
          data: {
            status: PaymentStatus.CANCELLED,
            gatewayResponse: executePaymentResult,
          },
        });
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-shipments?status=cancel`,
        };
      } else {
        return {
          redirectUrl: `${config.frontend_url}/dashboard/my-shipments?error=payment_failed`,
        };
      }
    },
    {
      maxWait: 10000,
      timeout: 15000,
    },
  );

  return transactionResult;
};

const cancelShipment = async (
  shipmentId : string,
  payload: ICancelShipmentPayload,
  user: requestUser,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findFirst({
      where: {
        id: shipmentId,
        merchant: {
          userId: user.userId,
        },
      },
      include: {
        payments: {
          where: {
            status: PaymentStatus.PAID,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!shipment) {
      throw new AppError(httpstatus.NOT_FOUND, "Shipment not found.");
    }

    const cancellableStatuses: ShipmentStatus[] = [
      ShipmentStatus.PAYMENT_PENDING,
      ShipmentStatus.PAYMENT_CONFIRMED,
    ];

    if (!cancellableStatuses.includes(shipment.status)) {
      throw new AppError(
        httpstatus.CONFLICT,
        `Shipment cannot be cancelled after ${shipment.status}.`,
      );
    }

    if (shipment.status === ShipmentStatus.PAYMENT_PENDING) {
      const cancelledShipment = await tx.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          status: ShipmentStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: payload.reason,
        },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.CANCELLED,
          description: `Shipment cancelled by merchant. Reason: ${payload.reason}`,
          updatedBy: user.userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: "SHIPMENT_CANCELLED",
          entity: "SHIPMENT",
          entityId: shipment.id,
          metadata: {
            reason: payload.reason,
            previousStatus: ShipmentStatus.PAYMENT_PENDING,
          },
        },
      });

      return {
        shipment: cancelledShipment,
        payment: null,
      };
    }
    const paidPayment = shipment.payments[0];

    if (!paidPayment) {
      throw new AppError(
        httpstatus.CONFLICT,
        "Paid payment record not found for this shipment.",
      );
    }

    if (!paidPayment.bkashPaymentId || !paidPayment.bkashTrxId) {
      throw new AppError(
        httpstatus.CONFLICT,
        "Required bKash payment information is missing.",
      );
    }

    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
      throw new AppError(
        httpstatus.BAD_GATEWAY,
        "bKash access token not found.",
      );
    }

    const refundResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/payment/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          paymentID: paidPayment.bkashPaymentId,
          trxID: paidPayment.bkashTrxId,
          amount: Number(paidPayment.amount),
          sku: "SWIFTDROP-SHIPMENT",
          reason: payload.reason,
        }),
      },
    );

    const refundResult = await refundResponse.json();

    if (!refundResponse.ok) {
      throw new AppError(
        httpstatus.BAD_GATEWAY,
        "bKash refund request failed.",
      );
    }

    // Verify bKash business-level success
    if (refundResult.statusCode !== "0000") {
      throw new AppError(
        httpstatus.BAD_REQUEST,
        refundResult.statusMessage || "bKash refund failed.",
      );
    }

    const refundAt = new Date();

    const updatedPayment = await tx.payment.update({
      where: {
        id: paidPayment.id,
      },
      data: {
        status: PaymentStatus.REFUNDED,
        refundTrxId: refundResult.refundTrxID,
        refundAmount: Number(paidPayment.amount),
        refundAt,
        refundReason: payload.reason,
        gatewayResponse: refundResult,
      },
    });

    const cancelledShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.CANCELLED,
        cancelledAt: refundAt,
        cancellationReason: payload.reason,
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.CANCELLED,
        description: `Shipment cancelled and payment refunded. Reason: ${payload.reason}`,
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_CANCELLED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          reason: payload.reason,
          previousStatus: ShipmentStatus.PAYMENT_CONFIRMED,
          paymentId: paidPayment.id,
          refundTrxId: refundResult.refundTrxID,
          refundAmount: Number(paidPayment.amount),
        },
      },
    });

    return {
      shipment: cancelledShipment,
      payment: updatedPayment,
    };
  });

  return transactionResult;
};
export const paymentService = {
  initiateShipmentPayment,
  initiateShipmentPaymentCallback,
  cancelShipment,
};
