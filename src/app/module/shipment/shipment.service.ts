import httpstatus from "http-status";
import { ShipmentStatus } from "../../../generated/prisma/enums";
import type { ICreateShipmentPayload } from "./shipment.validation";
import type { requestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { calculateDeliveryFee } from "./shipment.utils";
import type { IQuery } from "../../interface";
import type { ShipmentScalarWhereInput } from "../../../generated/prisma/models";

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
const getAllShipment = async (query: IQuery, user: requestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const addConditions: ShipmentScalarWhereInput[] = [];

  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpstatus.NOT_FOUND, "user  Not Found");
  }

  //searcing
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          recipientName: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          recipientAddress: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          recipientPhone: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.status) {
    addConditions.push({
      status: query.vehicleType as ShipmentStatus,
    });
  }
  addConditions.push({
    merchantId: isUserExist.merchantProfile?.id,
  });

  const totalShipment = await prisma.shipment.count({
    where: {
      AND: addConditions,
    },
  });
  const allShipment = await prisma.shipment.findMany({
    where: {
      AND: addConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      trackingEvents: true,
    },
  });
  return {
    data: allShipment,
    meta: {
      page: page,
      limit: limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit),
    },
  };
};
const getSingleShipment = async (shipmentId: string, user: requestUser) => {

  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(httpstatus.NOT_FOUND, "user  Not Found");
  }
  
  const singleShipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId,
      merchantId: isUserExist.merchantProfile?.id,
    },
    include: {
      trackingEvents: true,
    },
  });

  if (!singleShipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Shipment Not Found");
  }

  return singleShipment;
};

export const shipmentService = {
  createShipment,
  getAllShipment,
  getSingleShipment,
};
