import bcrypt from "bcryptjs";
import config from "../config";
import { prisma } from "../lib/prisma";
import AppError from "./AppError";
import httpstatus from "http-status";
import { UserRole } from "../../generated/prisma/enums";

export const seedTesterAdmin = async () => {
  try {
    const isTesterAdminExist = await prisma.user.findUnique({
      where: {
        email: config.tester_admin_email,
      },
    });

    if (isTesterAdminExist) {
      console.log("Tester Admin Already Exists");
      return;
    }
    const name = config.tester_admin_name;
    const email = config.tester_admin_email;
    const password = config.tester_admin_password;

    if (!name || !email || !password) {
      throw new AppError(
        httpstatus.INTERNAL_SERVER_ERROR,
        "Tester Admin Name,Email,Password Is Missing In ENV",
      );
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds),
    );

    const testerAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        emailVerified: true,
        role: UserRole.ADMIN,
        needPasswordChange: false,
      },
    });
    console.log("tester admin created : ", testerAdmin);
  } catch (error) {
    console.log("Error Seeding Tester Admin : ", error);
    await prisma.user.delete({
      where: {
        email: config.tester_admin_email,
      },
    });
  }
};
