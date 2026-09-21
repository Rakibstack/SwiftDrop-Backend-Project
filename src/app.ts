/** biome-ignore-all lint/style/useImportType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpstatus from "http-status";
import config from "./app/config";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFoundRoute";
import { UserRoutes } from "./app/module/user/user.route";
import { RiderRoutes } from "./app/module/rider/rider.route";

const app: Application = express();

app.use(
  cors({
    origin:config.frontend_url,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth',AuthRoutes)
app.use('/api/v1/user',UserRoutes)
app.use('/api/v1/rider',RiderRoutes)

app.get("/", async (req: Request, res: Response) => {
  res.status(httpstatus.OK).json({
    success: true,
    message:
      "Welcome to SwiftDrop — Merchant-Focused Courier & Last-Mile Logistics Platform ",
  });
});

app.use(globalErrorHandler)
app.use(notFound)

export default app;


