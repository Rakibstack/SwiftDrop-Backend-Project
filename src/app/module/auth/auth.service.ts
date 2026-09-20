/** biome-ignore-all lint/style/useNodejsImportProtocol: <explanation> */
/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import bcrypt from "bcryptjs";
import config from "../../config";
import crypto from "crypto";
import redisClient from "../../lib/redis";
import path from "path";
import transporter from "../../lib/nodemailer";
import ejs from "ejs";
import {
  IForgotPasswordPayload,
  ILoginUserPayload,
  IMerchantRegisterPayload,
  IResetPasswordPayload,
  IVerifyEmailPayload,
} from "./auth.validation";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserStatus } from "../../../generated/prisma/enums";
import { requestUser } from "../../middleware/checkAuth";

const registerMerchant = async (payload: IMerchantRegisterPayload) => {
  const {
    name,
    email,
    password,
    businessName,
    businessAddress,
    businessPhone,
  } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError(
      httpstatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const expiresInSeconds = 5 * 60;
  const otpKey = `merchant-register-otp:${email}`;
  const otpValue = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expiresInSeconds,
    },
  });

  const merchantRegisterkey = `merchant-register-data:${email}`;
  const merchantRegisterData = {
    name,
    email,
    password: hashedPassword,
    businessName,
    businessPhone,
    businessAddress,
  };
  await redisClient.set(
    merchantRegisterkey,
    JSON.stringify(merchantRegisterData),
    {
      expiration: {
        type: "EX",
        value: expiresInSeconds,
      },
    },
  );

  const templatePath = path.join(
    process.cwd(),
    "src/app/template/merchantRegisterOTP.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: name,
    otpValue,
    expiresIn: expiresInSeconds / 60,
    year: new Date().getFullYear(),
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: email,
    subject: "Email Verification OTP Send.",
    html,
  });
};
const verifyMerchantEmail = async (payload: IVerifyEmailPayload) => {
  const { otp, email } = payload;

  const otpKey = `merchant-register-otp:${email}`;

  const redisOtp = await redisClient.get(otpKey);
  if (!redisOtp) {
    throw new AppError(httpstatus.BAD_REQUEST, "Invalid Otp");
  }
  if (redisOtp !== otp) {
    throw new AppError(httpstatus.BAD_REQUEST, "Otp does not match");
  }
  await redisClient.del(otpKey);

  const merchantRegisterkey = `merchant-register-data:${email}`;
  const redisMerchantData = await redisClient.get(merchantRegisterkey);
  if (!redisMerchantData) {
    throw new AppError(httpstatus.NOT_FOUND, "User Does Not Exists");
  }
  const merchantPayload: IMerchantRegisterPayload =
    JSON.parse(redisMerchantData);

  const createdUser = await prisma.user.create({
    data: {
      name: merchantPayload.name,
      email: merchantPayload.email,
      password: merchantPayload.password,
      emailVerified: true,
      merchantProfile: {
        create: {
          businessName: merchantPayload.businessName,
          businessPhone: merchantPayload.businessPhone,
          businessAddress: merchantPayload.businessAddress,
        },
      },
    },
    omit: { password: true },
    include: { merchantProfile: true },
  });

  await redisClient.del(merchantRegisterkey);

  const templatePath = path.join(
    process.cwd(),
    "src/app/template/SwiftDrop-WelcomeEmail.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: merchantPayload.name,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: email,
    subject: "Welcome to SwiftDrop",
    html,
  });

  const { merchantProfile, ...user } = createdUser;
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    user,
    merchantProfile,
    accessToken,
    refreshToken,
  };
};
const loginUser = async (payload: ILoginUserPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpstatus.NOT_FOUND, "User not found");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(httpstatus.FORBIDDEN, "User is suspensed");
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(httpstatus.BAD_REQUEST, "User is deleted");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpstatus.UNAUTHORIZED, "Invalid credentials");
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};
const getMe = async (user: requestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    omit: {
      password: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(httpstatus.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

const refreshToken = async (token: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError(httpstatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError(
      httpstatus.UNAUTHORIZED,
      "User is inactive or not found",
    );
  }

  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const { email } = payload;

  const isForgotUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isForgotUserExist) {
    throw new AppError(httpstatus.NOT_FOUND, "User does not exists");
  }
  if (!isForgotUserExist.emailVerified) {
    throw new AppError(httpstatus.FORBIDDEN, "User Is Not Varified");
  }

  if (isForgotUserExist.status === "SUSPENDED") {
    throw new AppError(httpstatus.FORBIDDEN, "User is Suspended");
  }
  if (isForgotUserExist.isDeleted || isForgotUserExist.status === "DELETED") {
    throw new AppError(httpstatus.NOT_FOUND, "User Is Deleted");
  }
  if (
    isForgotUserExist.googleId &&
    isForgotUserExist.authProvider === "GOOGLE"
  ) {
    throw new AppError(httpstatus.BAD_REQUEST, "User Has Account With Google");
  }

  const expiresInSecend = 5 * 60;
  const otp = crypto.randomInt(100000, 1000000).toString();
  const key = `forgot-password-otp:${isForgotUserExist.email}`;

  await redisClient.set(key, otp, {
    expiration: {
      type: "EX",
      value: expiresInSecend,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/template/SwiftDrop-ForgotPasswordEmail.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: isForgotUserExist.name,
    otpValue: otp,
    expiresIn: expiresInSecend / 60,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: isForgotUserExist.email,
    subject: "Reset Your SwiftDrop Password",
    html,
  });
};
const resetPassword = async (payload: IResetPasswordPayload) => {
  const { otp, newPassword, email } = payload;

  const isResetUserExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isResetUserExist) {
    throw new AppError(httpstatus.NOT_FOUND, "User does not exists");
  }
  if (!isResetUserExist.emailVerified) {
    throw new AppError(httpstatus.FORBIDDEN, "User Is Not Varified");
  }

  if (isResetUserExist.status === "SUSPENDED") {
    throw new AppError(httpstatus.FORBIDDEN, "User is Suspended");
  }
  if (isResetUserExist.isDeleted || isResetUserExist.status === "DELETED") {
    throw new AppError(httpstatus.NOT_FOUND, "User Is Deleted");
  }
  if (isResetUserExist.googleId && isResetUserExist.authProvider === "GOOGLE") {
    throw new AppError(httpstatus.BAD_REQUEST, "User Has Account With Google");
  }
  const key = `forgot-password-otp:${isResetUserExist.email}`;

  const redisOtp = await redisClient.get(key);
  if (!redisOtp) {
    throw new AppError(httpstatus.BAD_REQUEST, "Invalid Otp");
  }
  if (redisOtp !== otp) {
    throw new AppError(httpstatus.BAD_REQUEST, "Otp does not match");
  }
  await redisClient.del(key);

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: {
      email: isResetUserExist.email,
    },
    data: {
      password: hashPassword,
    },
  });

  const templatePath = path.join(
    process.cwd(),
    "src/app/template/SwiftDrop-PasswordResetSuccess.ejs",
  );

  const html = await ejs.renderFile(templatePath, {
    name: isResetUserExist.name,
  });

  await transporter.sendMail({
    from: config.sender_email,
    to: isResetUserExist.email,
    subject: "Your SwiftDrop Password Was Reset",
    html,
  });
};

export const AuthService = {
  registerMerchant,
  verifyMerchantEmail,
  loginUser,getMe,
  refreshToken,
  forgotPassword,
  resetPassword
};
