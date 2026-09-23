import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import crypto from "crypto";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import type {
  IApplyAsRiderPayload,
  IReviewRiderPayload,
  IUpdateRiderProfilePayload,
  IVerifyEmailPayload,
} from "./rider.validation";
import transporter from "../../lib/nodemailer";
import redisClient from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import {
  RiderStatus,
  ShipmentStatus,
  UserRole,
  UserStatus,
  type VehicleType,
} from "../../../generated/prisma/enums";
import type { requestUser } from "../../middleware/checkAuth";
import type { IQuery } from "../../interface";
import type {
  RiderProfileWhereInput,
  ShipmentWhereInput,
} from "../../../generated/prisma/models";

const applyAsRider = async (payload: IApplyAsRiderPayload) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExist) {
    throw new AppError(
      httpstatus.CONFLICT,
      "Rider Already Exist With This Email",
    );
  }

  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(
    randomPassword,
    Number(config.bcrypt_salt_rounds),
  ); // Replace this with your actual password hashing logic
  const createRider = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: UserRole.RIDER,
      needPasswordChange: true,
      riderProfile: {
        create: {
          address: payload.address,
          phone: payload.phone,
          licenseNumber: payload.licenseNumber,
          vehicleType: payload.vehicleType,
        },
      },
    },
  });

  const expiresInSeconds = 60 * 60;
  const otpKey = `rider-emailVerify-otp:${payload.email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expiresInSeconds,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/template/SwiftDrop-RiderVerificationEmail.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: payload.name,
    otpValue,
    expiresIn: 60,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: payload.email,
    subject: "Verify Your SwiftDrop Rider Account",
    html,
  });

  return createRider;
};
const verifyRiderEmail = async (payload: IVerifyEmailPayload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
      role: UserRole.RIDER,
    },
  });

  if (!existingUser) {
    throw new AppError(
      httpstatus.NOT_FOUND,
      "Rider Application Not Found. Please Apply Again",
    );
  }
  if (existingUser.emailVerified) {
    throw new AppError(httpstatus.CONFLICT, "Email Already Varified");
  }

  const otpKey = `rider-emailVerify-otp:${email}`;
  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new AppError(
      httpstatus.BAD_REQUEST,
      "OTP Expired. Your Application Window Has Closed. Please Apply Again",
    );
  }

  if (redisOtp !== otp) {
    throw new AppError(httpstatus.BAD_REQUEST, "Otp Does Not Match");
  }

  await redisClient.del(otpKey);

  const verifyUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: true,
    },
    omit: { password: true },
    include: { riderProfile: true },
  });

  return verifyUser;
};

const approveRider = async (
  payload: IReviewRiderPayload,
  reviewer: requestUser,
) => {
  const { riderId, status, rejectionReason } = payload;

  const existingRider = await prisma.riderProfile.findUnique({
    where: { id: riderId },
    include: { user: true },
  });
  if (!existingRider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Application Not Found.");
  }
  if (!existingRider.user.emailVerified) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "Rider Has Not Verified Their Email Yet.Application Can Not Be reviewed ",
    );
  }

  if (existingRider.status !== RiderStatus.PENDING) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Rider Application Has Already Been ${existingRider.status.toLowerCase()}`,
    );
  }

  const updateRider = await prisma.riderProfile.update({
    where: {
      id: riderId,
    },
    include: { user: true },
    data: {
      status,
      rejectionReason: status === RiderStatus.REJECTED ? rejectionReason : null,
      rejectedAt: status === RiderStatus.REJECTED ? new Date() : null,

      reviewedBy: reviewer.userId,
      reviewedAt: new Date(),
    },
  });

  const isApproved = status === RiderStatus.ACTIVE;

  const templateName = isApproved
    ? "SwiftDrop-RiderApplicationApproved.ejs"
    : "SwiftDrop-RiderApplicationRejected.ejs";

  const templatePath = path.join(
    process.cwd(),
    `src/app/template/${templateName}`,
  );

  const html = await ejs.renderFile(templatePath, {
    name: updateRider.user.name,
    rejectionReason,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: updateRider.user.email,
    subject: isApproved
      ? "Your SwiftDrop Rider Application Has Been Approved"
      : "Update on Your SwiftDrop Rider Application",
    html,
  });
  return updateRider;
};

const getAllRiders = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const addConditions: RiderProfileWhereInput[] = [];

  //searcing
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          phone: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },

        {
          licenseNumber: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Vehicle Type - Enum
  if (query.vehicleType) {
    addConditions.push({
      vehicleType: query.vehicleType as VehicleType,
    });
  }

  // Address - String
  if (query.address) {
    addConditions.push({
      address: {
        contains: query.address,
        mode: "insensitive",
      },
    });
  }

  // License Number - String
  if (query.licenseNumber) {
    addConditions.push({
      licenseNumber: {
        equals: query.licenseNumber,
        mode: "insensitive",
      },
    });
  }

  // Rider Status - Enum
  if (query.status) {
    addConditions.push({
      status: query.status as RiderStatus,
    });
  }
  addConditions.push({
    isSuspended: false,
  });

  const totalRider = await prisma.riderProfile.count({
    where: {
      AND: addConditions,
    },
  });
  const allRiders = await prisma.riderProfile.findMany({
    where: {
      AND: addConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });
  return {
    data: allRiders,
    meta: {
      page: page,
      limit: limit,
      total: totalRider,
      totalPages: Math.ceil(totalRider / limit),
    },
  };
};
const getSingleRider = async (riderId: string) => {
  const singleRider = await prisma.riderProfile.findUnique({
    where: {
      id: riderId,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  if (!singleRider) {
    throw new AppError(httpstatus.NOT_FOUND, "Single Rider Not Found");
  }

  return singleRider;
};

const updateRiderProfile = async (
  payload: IUpdateRiderProfilePayload,
  user: requestUser,
) => {
  const existingRider = await prisma.riderProfile.findUnique({
    where: { userId: user.userId },
  });

  if (!existingRider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  const updatedRider = await prisma.riderProfile.update({
    where: { id: existingRider.id },
    data: payload,
  });

  return updatedRider;
};
const getMyAssignedShipments = async (query: IQuery, user: requestUser) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
    include: {
      user: true,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  if (rider.user.isDeleted) {
    throw new AppError(httpstatus.FORBIDDEN, "This account has been deleted.");
  }

  if (rider.user.status === UserStatus.SUSPENDED) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "This rider account is suspended.",
    );
  }

  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "Only active riders can access assigned shipments.",
    );
  }

  const conditions: ShipmentWhereInput[] = [
    {
      riderId: rider.id,
    },
  ];

  if (query.status) {
    conditions.push({
      status: query.status as ShipmentStatus,
    });
  }

  const totalShipment = await prisma.shipment.count({
    where: {
      AND: conditions,
    },
  });

  const shipments = await prisma.shipment.findMany({
    where: {
      AND: conditions,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      trackingId: true,

      senderName: true,
      senderPhone: true,
      senderAddress: true,

      recipientName: true,
      recipientPhone: true,
      recipientAddress: true,

      parcelType: true,
      parcelDescription: true,
      weight: true,

      codAmount: true,
      deliveryFee: true,

      status: true,

      assignedAt: true,
      pickedUpAt: true,
      deliveredAt: true,
      deliveryFailedAt: true,

      failureReason: true,

      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    data: shipments,
    meta: {
      page,
      limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit),
    },
  };
};
const acceptShipment = async (shipmentId: string, user: requestUser) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError(
      httpstatus.FORBIDDEN,
      "Only active riders can accept shipments.",
    );
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Assigned Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.ASSIGNED) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Shipment cannot be accepted while it is ${shipment.status}.`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.ACCEPTED,
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.ACCEPTED,
        description: "Rider accepted the shipment.",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_ACCEPTED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id,
        },
      },
    });

    return updatedShipment;
  });

  return result;
};

const pickupShipment = async (shipmentId: string, user: requestUser) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Assigned Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.ACCEPTED) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Shipment cannot be picked up while it is ${shipment.status}.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.PICKED_UP,
        pickedUpAt: new Date(),
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.PICKED_UP,
        description: "Shipment picked up by rider.",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_PICKED_UP",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id,
        },
      },
    });

    return updatedShipment;
  });
};
const markInTransit = async (shipmentId: string, user: requestUser) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Assigned Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.PICKED_UP) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Shipment cannot move to transit while it is ${shipment.status}.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.IN_TRANSIT,
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.IN_TRANSIT,
        description: "Shipment is now in transit.",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_IN_TRANSIT",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id,
        },
      },
    });

    return updatedShipment;
  });
};
const outForDelivery = async (shipmentId: string, user: requestUser) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Assigned Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Shipment cannot be marked out for delivery while it is ${shipment.status}.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.OUT_FOR_DELIVERY,
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        description: "Shipment is out for delivery.",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_OUT_FOR_DELIVERY",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id,
        },
      },
    });

    return updatedShipment;
  });
};
const deliverShipment = async (shipmentId: string, user: requestUser) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!rider) {
    throw new AppError(httpstatus.NOT_FOUND, "Rider Profile Not Found");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id,
    },
  });

  if (!shipment) {
    throw new AppError(httpstatus.NOT_FOUND, "Assigned Shipment Not Found");
  }

  if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
    throw new AppError(
      httpstatus.CONFLICT,
      `Shipment cannot be marked out for delivery while it is ${shipment.status}.`,
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status: ShipmentStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.DELIVERED,
        description: "Shipment delivered successfully.",
        updatedBy: user.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_DELIVERED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id,
        },
      },
    });

    return updatedShipment;
  });
};

export const riderService = {
  applyAsRider,
  verifyRiderEmail,
  approveRider,
  getAllRiders,
  getSingleRider,
  updateRiderProfile,
  getMyAssignedShipments,
  acceptShipment,
  pickupShipment,markInTransit,
  outForDelivery,deliverShipment
};
