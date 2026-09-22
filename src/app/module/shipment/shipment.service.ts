import httpstatus from "http-status";
import { ShipmentStatus } from "../../../generated/prisma/enums";
import { ICreateShipmentPayload } from "./shipment.validation";
import { requestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { calculateDeliveryFee } from "./shipment.utils";
import { IQuery } from "../../interface";
import { ShipmentScalarWhereInput } from "../../../generated/prisma/models";

const generateTrackingId = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `SWD-${date}-${randomPart}`;
};

const createShipment = async (
  payload: ICreateShipmentPayload,
  user: requestUser,
) => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: {
      userId: user.userId,
    },
    include: {
      user: true,
    },
  });

  if (!merchant) {
    throw new AppError(httpstatus.NOT_FOUND, "Merchant Profile Not Found");
  }
  if (merchant.user.isDeleted) {
    throw new AppError(httpstatus.NOT_FOUND, "This User Is Deleted");
  }

  const trackingId = generateTrackingId();

  const deliveryFee = calculateDeliveryFee(payload.weight);

  const result = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
      data: {
        trackingId,
        merchantId: merchant.id,

        senderName: payload.senderName,
        senderPhone: payload.senderPhone,
        senderAddress: payload.senderAddress,

        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        recipientAddress: payload.recipientAddress,

        parcelType: payload.parcelType,
        parcelDescription: payload.parcelDescription,
        weight: payload.weight,
        deliveryFee: deliveryFee,
        codAmount: payload.codAmount,

        status: ShipmentStatus.PAYMENT_PENDING,
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.PAYMENT_PENDING,
        description: "Shipment created and waiting for payment",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_CREATED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          status: ShipmentStatus.PAYMENT_PENDING,
        },
      },
    });

    return shipment;
  });

  return result;
};


export const shipmentService = {
  createShipment,
  getAllShipment,
  getSingleShipment
};
