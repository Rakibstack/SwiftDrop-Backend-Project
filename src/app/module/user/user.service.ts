// biome-ignore lint/style/useImportType: <explanation>
/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { prisma } from "../../lib/prisma";
import { cloudinary } from "../../lib/cloudinary";
import { UploadApiResponse } from "cloudinary";

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

export const userService = {
  updateUserProfile,
};
