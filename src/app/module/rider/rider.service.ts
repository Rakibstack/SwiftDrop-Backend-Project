/** biome-ignore-all lint/style/useNodejsImportProtocol: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
/** biome-ignore-all lint/style/useImportType: <explanation> */
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import crypto from "crypto";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import { IApplyAsRiderPayload, IVerifyEmailPayload } from "./rider.validation";
import transporter from "../../lib/nodemailer";
import redisClient from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { UserRole } from "../../../generated/prisma/enums";

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

export const riderService = {
  applyAsRider,
  verifyRiderEmail
};
