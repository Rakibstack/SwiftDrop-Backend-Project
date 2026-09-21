import app from "./app";
import config from "./app/config";
import transporter from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import redisClient from "./app/lib/redis";
import { seedTesterAdmin } from "./app/utils/seed";

const port = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("connected to the database successfully");
    await redisClient.connect();
    console.log("Redis  Connected Successfully.");
    await transporter.verify();
    console.log("Nodemailer Conneted Successfully.");
    await seedTesterAdmin();
    console.log("Tester Admin Created Successfully.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

main();
