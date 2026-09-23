import httpstatus from "http-status";
import {
  RiderStatus,
  ShipmentStatus,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";
import type {
  IAssignRiderPayload,
  ICreateShipmentPayload,
} from "./shipment.validation";
import type { requestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { calculateDeliveryFee } from "./shipment.utils";
import type { IQuery } from "../../interface";
import type {
  ShipmentScalarWhereInput,
  ShipmentWhereInput,
} from "../../../generated/prisma/models";

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
// admin only api
const getAllShipmentAdmin = async (query: IQuery, user: requestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const addConditions: ShipmentWhereInput[] = [];

  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!existingUser) {
    throw new AppError(httpstatus.NOT_FOUND, "User Not Found");
  }

  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "You are not authorized to access shipment records.",
    );
  }

  // Search
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          trackingId: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          senderName: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          senderPhone: {
            contains: query.searchTerm,
          },
        },
        {
          recipientName: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          recipientPhone: {
            contains: query.searchTerm,
          },
        },
        {
          recipientAddress: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Status filter
  if (query.status) {
    addConditions.push({
      status: query.status as ShipmentStatus,
    });
  }

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
    skip,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      payments: true,
      trackingEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      merchant: {
        select: {
          id: true,
          businessName: true,
          businessPhone: true,
        },
      },
      rider: {
        select: {
          id: true,
          phone: true,
          vehicleType: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return {
    data: allShipment,
    meta: {
      page,
      limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit),
    },
  };
};
const getSingleShipmentAdmin = async (
  shipmentId: string,
  user: requestUser,
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!existingUser) {
    throw new AppError(httpstatus.NOT_FOUND, "User Not Found");
  }

  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "You are not authorized to access shipment records.",
    );
  }

  const singleShipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId,
    },
    include: {
      trackingEvents: {
        orderBy: {
          createdAt: "asc",
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
      merchant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      rider: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!singleShipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Shipment Not Found");
  }

  return singleShipment;
};
const assignRider = async (
  shipmentId: string,
  payload: IAssignRiderPayload,
  user: requestUser,
) => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!existingAdmin) {
    throw new AppError(httpstatus.NOT_FOUND, "Admin Not Found");
  }

  if (existingAdmin.role !== UserRole.ADMIN) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "You are not authorized to assign riders.",
    );
  }

  const shipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.PAYMENT_CONFIRMED) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Rider cannot be assigned while shipment is ${shipment.status}.`,
    );
  }

  if (shipment.riderId) {
    throw new AppError(
      httpstatus.CONFLICT,
      "A rider is already assigned to this shipment.",
    );
  }

  const rider = await prisma.riderProfile.findUnique({
    where: {
      id: payload.riderId,
    },
    include: {
      user: true,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Not Found");
  }

  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError(
      httpstatus.CONFLICT,
      "Only active riders can be assigned to shipments.",
    );
  }

  if (rider.user.isDeleted) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "This rider account has been deleted.",
    );
  }

  if (rider.user.status === UserStatus.SUSPENDED) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "This rider account is suspended.",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipmentId,
      },
      data: {
        riderId: rider.id,
        assignedAt: new Date(),
        status: ShipmentStatus.ASSIGNED,
      },
      include: {
        rider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.ASSIGNED,
        description: `Shipment assigned to rider ${rider.user.name}.`,
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "RIDER_ASSIGNED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          riderId: rider.id,
          riderName: rider.user.name,
          trackingId: shipment.trackingId,
        },
      },
    });

    return updatedShipment;
  });

  return result;
};
// merchant only api
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
  getAllShipmentAdmin,
  getSingleShipmentAdmin,
  assignRider,
};
