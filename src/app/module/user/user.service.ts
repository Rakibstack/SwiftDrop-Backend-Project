// biome-ignore lint/style/useImportType: <explanation>
/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { prisma } from "../../lib/prisma";
import { cloudinary } from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { IUpdateMerchantProfilePayload } from "./user.validation";
import { requestUser } from "../../middleware/checkAuth";
import AppError from "../../utils/AppError";
import httpstatus from "http-status";
import { IQuery } from "../../interface";
import { UserWhereInput } from "../../../generated/prisma/models";

// user only api
const updateUserProfile = async (buffer: Buffer, userId: string) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      imagePublicId: true,
      imageUrl: true,
    },
  });
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
  // Cloudinary upload successfully completed
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    },
    omit: {
      password: true,
    },
  });

  if (currentUser?.imagePublicId && currentUser.imagePublicId) {
    await cloudinary.uploader.destroy(currentUser.imagePublicId);
  }
  return updatedUser;
};

const updateMerchantProfile = async (
  payload: IUpdateMerchantProfilePayload,
  user: requestUser,
) => {
  const existingMerchant = await prisma.merchantProfile.findUnique({
    where: { userId: user.userId },
  });

  if (!existingMerchant) {
    throw new AppError(httpstatus.NOT_FOUND, "Merchant Profile Not Found");
  }

  const updatedMerchant = await prisma.merchantProfile.update({
    where: { id: existingMerchant.id },
    data: payload,
  });

  return updatedMerchant;
};
// admin only api
const getAllUsers = async (query: IQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const addConditions: UserWhereInput[] = [];

  //searcing
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  addConditions.push({
    isDeleted: false,
  });

  const totalUsers = await prisma.user.count({
    where: {
      AND: addConditions,
    },
  });
  const allusers = await prisma.user.findMany({
    where: {
      AND: addConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      merchantProfile: true,
      riderProfile : true,
    },
    omit: {
      password: true,
    },
  });
  return {
    data: allusers,
    meta: {
      page: page,
      limit: limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

export const userService = {
  updateUserProfile,
  updateMerchantProfile,
  getAllUsers,
  deleteUser,
  getSingleUser
};
