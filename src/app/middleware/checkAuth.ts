import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import AppError from "../utils/AppError";
import httpstatus from "http-status";
import { UserRole } from "../../generated/prisma/enums";

export interface requestUser {
  email: string;
  name: string;
  userId: string;
  role: UserRole;
}
declare global {
  namespace Express {
    interface Request {
      user?: requestUser;
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpstatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(httpstatus.UNAUTHORIZED, verifiedToken.error);
    }

    const { email, name, userId, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpstatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        email,
        role,
      },
    });

    if (!user) {
      throw new AppError(
        httpstatus.UNAUTHORIZED,
        "User not found. Please log in again.",
      );
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        httpstatus.FORBIDDEN,
        "Your account has been suspended. Please contact support.",
      );
    }
    if (user.isDeleted) {
      throw new AppError(
        httpstatus.FORBIDDEN,
        "Your account has been Deleted. Please contact support.",
      );
    }

    req.user = {
      email,
      name,
      userId,
      role,
    };

    next();
  });
};
