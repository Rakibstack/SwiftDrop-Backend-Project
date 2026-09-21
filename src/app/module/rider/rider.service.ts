/** biome-ignore-all lint/style/useNodejsImportProtocol: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
/** biome-ignore-all lint/style/useImportType: <explanation> */
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import crypto from "crypto";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import {
  IApplyAsRiderPayload,
  IReviewRiderPayload,
  IUpdateRiderProfilePayload,
  IVerifyEmailPayload,
} from "./rider.validation";
import transporter from "../../lib/nodemailer";
import redisClient from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { RiderStatus, UserRole, VehicleType } from "../../../generated/prisma/enums";
import { requestUser } from "../../middleware/checkAuth";
import { IQuery } from "../../interface";
import { RiderProfileWhereInput } from "../../../generated/prisma/models";

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
  return updateRider
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

  return singleRider
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

export const riderService = {
  applyAsRider,
  verifyRiderEmail,
  approveRider,
  getAllRiders,
  getSingleRider,
  updateRiderProfile
};
