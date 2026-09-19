import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpstatus from "http-status";
import config from "./app/config";

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

app.get("/", async (req: Request, res: Response) => {
  res.status(httpstatus.OK).json({
    success: true,
    message:
      "Welcome to SwiftDrop — Merchant-Focused Courier & Last-Mile Logistics Platform ",
  });
});

export default app;


