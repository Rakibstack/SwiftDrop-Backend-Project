import cron from "node-cron";
import { prisma } from "./prisma";
import { RiderStatus, UserRole } from "../../generated/prisma/enums";

const cleanupRiderApplications = async () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      // Delete unverified pending rider applications older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const deletedUnverifiedRiders = await prisma.user.deleteMany({
        where: {
          role: UserRole.RIDER,
          emailVerified: false,
          createdAt: {
            lt: oneHourAgo,
          },
          riderProfile: {
            status: RiderStatus.PENDING,
          },
        },
      });

      // Delete rejected rider applications older than 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const deletedRejectedRiders = await prisma.user.deleteMany({
        where: {
          role: UserRole.RIDER,
          riderProfile: {
            status: RiderStatus.REJECTED,
            rejectedAt: {
              lt: oneMonthAgo,
            },
          },
        },
      });

      const unverifiedCount = deletedUnverifiedRiders.count;
      const rejectedCount = deletedRejectedRiders.count;

      if (unverifiedCount > 0 || rejectedCount > 0) {
        console.log(
          `Rider application cleanup completed: ${unverifiedCount} unverified pending application(s) and ${rejectedCount} rejected application(s) were removed.`,
        );
      } else {
        console.log(
          "Rider application cleanup completed: no expired applications found.",
        );
      }
    } catch (error) {
      console.error(
        "Rider application cleanup failed while removing expired applications:",
        error,
      );
    }
  });

  console.log(
    "Rider application cleanup job scheduled successfully. It will run every 10 minutes.",
  );
};

export default cleanupRiderApplications;
