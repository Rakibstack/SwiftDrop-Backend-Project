import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";

const port =config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("connected to the database successfully");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect()
    process.exit(1)
  }
};

main();
