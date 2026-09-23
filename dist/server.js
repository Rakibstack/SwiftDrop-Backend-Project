
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpstatus12 from "http-status";

// src/app/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  backend_url: process.env.BACKEND_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  tester_admin_name: process.env.TESTER_ADMIN_NAME,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD,
  redis_username: process.env.REDIS_USERNAME,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  smtp_user: process.env.SMTP_USER,
  sender_email: process.env.SENDER_EMAIL,
  smtp_password: process.env.SMTP_PASSWORD,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  bkash_username: process.env.BKASH_USERNAME,
  bkash_password: process.env.BKASH_PASSWORD,
  bkash_app_key: process.env.BKASH_APP_KEY,
  bkash_app_secret: process.env.BKASH_APP_SECRET,
  bkash_base_url: process.env.BKASH_BASE_URL,
  bkash_callback_url: process.env.BKASH_CALLBACK_URL
};

// src/app/module/auth/auth.route.ts
import { Router } from "express";

// src/app/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model RiderProfile {\n  id            String      @id @default(uuid())\n  phone         String\n  address       String\n  vehicleType   VehicleType\n  licenseNumber String      @unique\n\n  status RiderStatus @default(PENDING)\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  isSuspended     Boolean   @default(false)\n  sespendedAt     DateTime?\n  rejectedAt      DateTime?\n  rejectionReason String?\n  reviewedBy      String?\n  reviewedAt      DateTime?\n\n  shipments Shipment[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([status])\n  @@map("rider_profiles")\n}\n\nmodel AuditLog {\n  id String @id @default(uuid())\n\n  userId String?\n\n  action   String\n  entity   String\n  entityId String?\n\n  metadata Json?\n\n  createdAt DateTime @default(now())\n\n  user User? @relation(fields: [userId], references: [id], onDelete: SetNull, onUpdate: Cascade)\n\n  @@index([userId])\n  @@index([entity, entityId])\n  @@index([createdAt])\n  @@map("audit_logs")\n}\n\nenum UserRole {\n  MERCHANT\n  RIDER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  SUSPENDED\n  DELETED\n}\n\nenum RiderStatus {\n  PENDING\n  REJECTED\n  ACTIVE\n  SUSPENDED\n}\n\nenum AuthProvider {\n  GOOGLE\n  CREDENTIAL\n}\n\nenum VehicleType {\n  BIKE\n  MOTORCYCLE\n}\n\nenum ShipmentStatus {\n  PAYMENT_PENDING\n  PAYMENT_CONFIRMED\n  ASSIGNED\n  ACCEPTED\n  PICKED_UP\n  IN_TRANSIT\n  OUT_FOR_DELIVERY\n  DELIVERED\n  DELIVERY_FAILED\n  RETURNED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  UNPAID\n  PENDING\n  PAID\n  FAILED\n  CANCELLED\n  EXPIRED\n  REFUNDED\n}\n\nmodel MerchantProfile {\n  id              String @id @default(uuid())\n  businessName    String\n  businessPhone   String\n  businessAddress String\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @updatedAt\n  shipments Shipment[]\n\n  @@map("merchant_profiles")\n}\n\nmodel Payment {\n  id String @id @default(uuid())\n\n  status PaymentStatus @default(UNPAID)\n\n  currency String  @default("BDT")\n  amount   Decimal @db.Decimal(10, 2)\n\n  paymentGateway String @default("BKASH")\n\n  merchantInvoiceNumber String  @unique\n  bkashPaymentId        String? @unique\n  bkashTrxId            String? @unique\n  payerReference        String?\n\n  paidAt DateTime?\n\n  gatewayResponse Json?\n\n  refundTrxId  String?\n  refundAmount Decimal?  @db.Decimal(10, 2)\n  refundReason String?\n  refundAt     DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  shipmentId String\n  shipment   Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  @@index([shipmentId])\n  @@index([status])\n  @@map("payments")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Shipment {\n  id String @id @default(uuid())\n\n  trackingId String @unique\n\n  merchantId String\n  merchant   MerchantProfile @relation(fields: [merchantId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  riderId String?\n  rider   RiderProfile? @relation(fields: [riderId], references: [id], onDelete: SetNull, onUpdate: Cascade)\n\n  senderName    String\n  senderPhone   String\n  senderAddress String\n\n  recipientName    String\n  recipientPhone   String\n  recipientAddress String\n\n  parcelType        String\n  parcelDescription String?\n  weight            Decimal? @db.Decimal(8, 2)\n\n  deliveryFee Decimal @db.Decimal(10, 2)\n  codAmount   Decimal @default(0) @db.Decimal(10, 2)\n\n  status ShipmentStatus @default(PAYMENT_PENDING)\n\n  // Delivery timestamps\n  assignedAt       DateTime?\n  pickedUpAt       DateTime?\n  deliveredAt      DateTime?\n  deliveryFailedAt DateTime?\n\n  failureReason String?\n\n  cancelledAt        DateTime?\n  cancellationReason String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  payments       Payment[]\n  trackingEvents TrackingEvent[]\n\n  @@index([merchantId])\n  @@index([riderId])\n  @@index([status])\n  @@index([createdAt])\n  @@map("shipments")\n}\n\nmodel TrackingEvent {\n  id String @id @default(uuid())\n\n  shipmentId String\n\n  status ShipmentStatus\n\n  location    String?\n  description String?\n\n  updatedBy String?\n\n  createdAt DateTime @default(now())\n\n  shipment Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  @@index([shipmentId])\n  @@index([status])\n  @@index([createdAt])\n  @@map("tracking_events")\n}\n\nmodel User {\n  id            String       @id @default(uuid())\n  name          String\n  email         String       @unique\n  password      String?\n  googleId      String?      @unique\n  role          UserRole     @default(MERCHANT)\n  status        UserStatus   @default(ACTIVE)\n  emailVerified Boolean      @default(false)\n  authProvider  AuthProvider @default(CREDENTIAL)\n\n  imageUrl           String  @default("")\n  imagePublicId      String  @default("")\n  needPasswordChange Boolean @default(false)\n\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  merchantProfile MerchantProfile?\n  riderProfile    RiderProfile?\n  auditLogs       AuditLog[]\n\n  @@map("users")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"RiderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"vehicleType","kind":"enum","type":"VehicleType"},{"name":"licenseNumber","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"RiderStatus"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"RiderProfileToUser"},{"name":"isSuspended","kind":"scalar","type":"Boolean"},{"name":"sespendedAt","kind":"scalar","type":"DateTime"},{"name":"rejectedAt","kind":"scalar","type":"DateTime"},{"name":"rejectionReason","kind":"scalar","type":"String"},{"name":"reviewedBy","kind":"scalar","type":"String"},{"name":"reviewedAt","kind":"scalar","type":"DateTime"},{"name":"shipments","kind":"object","type":"Shipment","relationName":"RiderProfileToShipment"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"rider_profiles","schema":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"entity","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AuditLogToUser"}],"dbName":"audit_logs","schema":null},"MerchantProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"businessName","kind":"scalar","type":"String"},{"name":"businessPhone","kind":"scalar","type":"String"},{"name":"businessAddress","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"MerchantProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"shipments","kind":"object","type":"Shipment","relationName":"MerchantProfileToShipment"}],"dbName":"merchant_profiles","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"currency","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"paymentGateway","kind":"scalar","type":"String"},{"name":"merchantInvoiceNumber","kind":"scalar","type":"String"},{"name":"bkashPaymentId","kind":"scalar","type":"String"},{"name":"bkashTrxId","kind":"scalar","type":"String"},{"name":"payerReference","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"gatewayResponse","kind":"scalar","type":"Json"},{"name":"refundTrxId","kind":"scalar","type":"String"},{"name":"refundAmount","kind":"scalar","type":"Decimal"},{"name":"refundReason","kind":"scalar","type":"String"},{"name":"refundAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"shipmentId","kind":"scalar","type":"String"},{"name":"shipment","kind":"object","type":"Shipment","relationName":"PaymentToShipment"}],"dbName":"payments","schema":null},"Shipment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"trackingId","kind":"scalar","type":"String"},{"name":"merchantId","kind":"scalar","type":"String"},{"name":"merchant","kind":"object","type":"MerchantProfile","relationName":"MerchantProfileToShipment"},{"name":"riderId","kind":"scalar","type":"String"},{"name":"rider","kind":"object","type":"RiderProfile","relationName":"RiderProfileToShipment"},{"name":"senderName","kind":"scalar","type":"String"},{"name":"senderPhone","kind":"scalar","type":"String"},{"name":"senderAddress","kind":"scalar","type":"String"},{"name":"recipientName","kind":"scalar","type":"String"},{"name":"recipientPhone","kind":"scalar","type":"String"},{"name":"recipientAddress","kind":"scalar","type":"String"},{"name":"parcelType","kind":"scalar","type":"String"},{"name":"parcelDescription","kind":"scalar","type":"String"},{"name":"weight","kind":"scalar","type":"Decimal"},{"name":"deliveryFee","kind":"scalar","type":"Decimal"},{"name":"codAmount","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"ShipmentStatus"},{"name":"assignedAt","kind":"scalar","type":"DateTime"},{"name":"pickedUpAt","kind":"scalar","type":"DateTime"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"deliveryFailedAt","kind":"scalar","type":"DateTime"},{"name":"failureReason","kind":"scalar","type":"String"},{"name":"cancelledAt","kind":"scalar","type":"DateTime"},{"name":"cancellationReason","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToShipment"},{"name":"trackingEvents","kind":"object","type":"TrackingEvent","relationName":"ShipmentToTrackingEvent"}],"dbName":"shipments","schema":null},"TrackingEvent":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"shipmentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ShipmentStatus"},{"name":"location","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"updatedBy","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"shipment","kind":"object","type":"Shipment","relationName":"ShipmentToTrackingEvent"}],"dbName":"tracking_events","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"authProvider","kind":"enum","type":"AuthProvider"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"imagePublicId","kind":"scalar","type":"String"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"merchantProfile","kind":"object","type":"MerchantProfile","relationName":"MerchantProfileToUser"},{"name":"riderProfile","kind":"object","type":"RiderProfile","relationName":"RiderProfileToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","user","orderBy","cursor","merchant","rider","shipment","payments","trackingEvents","_count","shipments","merchantProfile","riderProfile","auditLogs","RiderProfile.findUnique","RiderProfile.findUniqueOrThrow","RiderProfile.findFirst","RiderProfile.findFirstOrThrow","RiderProfile.findMany","data","RiderProfile.createOne","RiderProfile.createMany","RiderProfile.createManyAndReturn","RiderProfile.updateOne","RiderProfile.updateMany","RiderProfile.updateManyAndReturn","create","update","RiderProfile.upsertOne","RiderProfile.deleteOne","RiderProfile.deleteMany","having","_min","_max","RiderProfile.groupBy","RiderProfile.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","MerchantProfile.findUnique","MerchantProfile.findUniqueOrThrow","MerchantProfile.findFirst","MerchantProfile.findFirstOrThrow","MerchantProfile.findMany","MerchantProfile.createOne","MerchantProfile.createMany","MerchantProfile.createManyAndReturn","MerchantProfile.updateOne","MerchantProfile.updateMany","MerchantProfile.updateManyAndReturn","MerchantProfile.upsertOne","MerchantProfile.deleteOne","MerchantProfile.deleteMany","MerchantProfile.groupBy","MerchantProfile.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","_avg","_sum","Payment.groupBy","Payment.aggregate","Shipment.findUnique","Shipment.findUniqueOrThrow","Shipment.findFirst","Shipment.findFirstOrThrow","Shipment.findMany","Shipment.createOne","Shipment.createMany","Shipment.createManyAndReturn","Shipment.updateOne","Shipment.updateMany","Shipment.updateManyAndReturn","Shipment.upsertOne","Shipment.deleteOne","Shipment.deleteMany","Shipment.groupBy","Shipment.aggregate","TrackingEvent.findUnique","TrackingEvent.findUniqueOrThrow","TrackingEvent.findFirst","TrackingEvent.findFirstOrThrow","TrackingEvent.findMany","TrackingEvent.createOne","TrackingEvent.createMany","TrackingEvent.createManyAndReturn","TrackingEvent.updateOne","TrackingEvent.updateMany","TrackingEvent.updateManyAndReturn","TrackingEvent.upsertOne","TrackingEvent.deleteOne","TrackingEvent.deleteMany","TrackingEvent.groupBy","TrackingEvent.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","googleId","UserRole","role","UserStatus","status","emailVerified","AuthProvider","authProvider","imageUrl","imagePublicId","needPasswordChange","isDeleted","deletedAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","shipmentId","ShipmentStatus","location","description","updatedBy","trackingId","merchantId","riderId","senderName","senderPhone","senderAddress","recipientName","recipientPhone","recipientAddress","parcelType","parcelDescription","weight","deliveryFee","codAmount","assignedAt","pickedUpAt","deliveredAt","deliveryFailedAt","failureReason","cancelledAt","cancellationReason","PaymentStatus","currency","amount","paymentGateway","merchantInvoiceNumber","bkashPaymentId","bkashTrxId","payerReference","paidAt","gatewayResponse","refundTrxId","refundAmount","refundReason","refundAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","businessName","businessPhone","businessAddress","userId","action","entity","entityId","metadata","phone","address","VehicleType","vehicleType","licenseNumber","RiderStatus","isSuspended","sespendedAt","rejectedAt","rejectionReason","reviewedBy","reviewedAt","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "zQNBcBQBAAD8AQAgCgAA_QEAIIYBAACQAgAwhwEAAAkAEIgBAACQAgAwiQEBAAAAAZEBAACSAuYBIpoBQADlAQAhmwFAAOUBACHbAQEAAAAB4AEBAN4BACHhAQEA3gEAIeMBAACRAuMBIuQBAQAAAAHmASAA4gEAIecBQADkAQAh6AFAAOQBACHpAQEA3wEAIeoBAQDfAQAh6wFAAOQBACEBAAAAAQAgDAEAAPwBACAKAAD9AQAghgEAAPsBADCHAQAAAwAQiAEAAPsBADCJAQEA3gEAIZoBQADlAQAhmwFAAOUBACHYAQEA3gEAIdkBAQDeAQAh2gEBAN4BACHbAQEA3gEAIQEAAAADACAgBAAAlAIAIAUAAOcBACAHAACVAgAgCAAAlgIAIIYBAACTAgAwhwEAAAUAEIgBAACTAgAwiQEBAN4BACGRAQAAigKsASKaAUAA5QEAIZsBQADlAQAhrwEBAN4BACGwAQEA3gEAIbEBAQDfAQAhsgEBAN4BACGzAQEA3gEAIbQBAQDeAQAhtQEBAN4BACG2AQEA3gEAIbcBAQDeAQAhuAEBAN4BACG5AQEA3wEAIboBEACPAgAhuwEQAI4CACG8ARAAjgIAIb0BQADkAQAhvgFAAOQBACG_AUAA5AEAIcABQADkAQAhwQEBAN8BACHCAUAA5AEAIcMBAQDfAQAhDgQAAP4CACAFAAD_AgAgBwAApAMAIAgAAKUDACCxAQAAlwIAILkBAACXAgAgugEAAJcCACC9AQAAlwIAIL4BAACXAgAgvwEAAJcCACDAAQAAlwIAIMEBAACXAgAgwgEAAJcCACDDAQAAlwIAICAEAACUAgAgBQAA5wEAIAcAAJUCACAIAACWAgAghgEAAJMCADCHAQAABQAQiAEAAJMCADCJAQEAAAABkQEAAIoCrAEimgFAAOUBACGbAUAA5QEAIa8BAQAAAAGwAQEA3gEAIbEBAQDfAQAhsgEBAN4BACGzAQEA3gEAIbQBAQDeAQAhtQEBAN4BACG2AQEA3gEAIbcBAQDeAQAhuAEBAN4BACG5AQEA3wEAIboBEACPAgAhuwEQAI4CACG8ARAAjgIAIb0BQADkAQAhvgFAAOQBACG_AUAA5AEAIcABQADkAQAhwQEBAN8BACHCAUAA5AEAIcMBAQDfAQAhAwAAAAUAIAIAAAYAMAMAAAcAIBQBAAD8AQAgCgAA_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_AQAwhwEAADMAEIgBAAD_AQAwiQEBAMMBACGRAQAAgQLmASKaAUAAygEAIZsBQADKAQAh2wEBAMMBACHgAQEAwwEAIeEBAQDDAQAh4wEAAIAC4wEi5AEBAMMBACHmASAAxwEAIecBQADJAQAh6AFAAMkBACHpAQEAxAEAIeoBAQDEAQAh6wFAAMkBACEDAAAACQAgAgAAMgAwHwAAMwAgAwAAAAkAIAIAACEAMAMAAAEAIAEAAAAZACABAAAAGQAgAwAAABcAIAIAABgAMAMAABkAIAMAAAAXACACAAAYADADAAAZACADAAAAFwAgAgAAGAAwAwAAGQAgCAEAAJ0DACCJAQEAAAABmgFAAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAYAAAAABARMAADsAIAeJAQEAAAABmgFAAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAYAAAAABARMAAD0AMAETAAA9ADABAAAAGwAgCAEAAJwDACCJAQEAmwIAIZoBQACiAgAh2wEBAJwCACHcAQEAmwIAId0BAQCbAgAh3gEBAJwCACHfAYAAAAABAgAAABkAIBMAAEEAIAeJAQEAmwIAIZoBQACiAgAh2wEBAJwCACHcAQEAmwIAId0BAQCbAgAh3gEBAJwCACHfAYAAAAABAgAAABcAIBMAAEMAIAIAAAAXACATAABDACABAAAAGwAgAwAAABkAIBoAADsAIBsAAEEAIAEAAAAZACABAAAAFwAgBgkAAJkDACAgAACbAwAgIQAAmgMAINsBAACXAgAg3gEAAJcCACDfAQAAlwIAIAqGAQAA_gEAMIcBAABLABCIAQAA_gEAMIkBAQDDAQAhmgFAAMoBACHbAQEAxAEAIdwBAQDDAQAh3QEBAMMBACHeAQEAxAEAId8BAAD2AQAgAwAAABcAIAIAAEoAMB8AAEsAIAMAAAAXACACAAAYADADAAAZACAMAQAA_AEAIAoAAP0BACCGAQAA-wEAMIcBAAADABCIAQAA-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_AUAAAAABwAFAAAAAAcEBAQAAAAHCAUAAAAABwwEBAAAAAQETAACDAQAwARMAAIMBADABAAAACQAgHQQAAMgCACAFAAD3AgAgBwAAyQIAIAgAAMoCACCJAQEAmwIAIZEBAADGAqwBIpoBQACiAgAhmwFAAKICACGvAQEAmwIAIbABAQCbAgAhsQEBAJwCACGyAQEAmwIAIbMBAQCbAgAhtAEBAJsCACG1AQEAmwIAIbYBAQCbAgAhtwEBAJsCACG4AQEAmwIAIbkBAQCcAgAhugEQAMQCACG7ARAAxQIAIbwBEADFAgAhvQFAAKECACG-AUAAoQIAIb8BQAChAgAhwAFAAKECACHBAQEAnAIAIcIBQAChAgAhwwEBAJwCACECAAAABwAgEwAAhwEAIBmJAQEAmwIAIZEBAADGAqwBIpoBQACiAgAhmwFAAKICACGvAQEAmwIAIbABAQCbAgAhsQEBAJwCACGyAQEAmwIAIbMBAQCbAgAhtAEBAJsCACG1AQEAmwIAIbYBAQCbAgAhtwEBAJsCACG4AQEAmwIAIbkBAQCcAgAhugEQAMQCACG7ARAAxQIAIbwBEADFAgAhvQFAAKECACG-AUAAoQIAIb8BQAChAgAhwAFAAKECACHBAQEAnAIAIcIBQAChAgAhwwEBAJwCACECAAAABQAgEwAAiQEAIAIAAAAFACATAACJAQAgAQAAAAkAIAMAAAAHACAaAACBAQAgGwAAhwEAIAEAAAAHACABAAAABQAgDwkAAIYDACAgAACJAwAgIQAAiAMAIFIAAIcDACBTAACKAwAgsQEAAJcCACC5AQAAlwIAILoBAACXAgAgvQEAAJcCACC-AQAAlwIAIL8BAACXAgAgwAEAAJcCACDBAQAAlwIAIMIBAACXAgAgwwEAAJcCACAchgEAAO0BADCHAQAAkQEAEIgBAADtAQAwiQEBAMMBACGRAQAA6gGsASKaAUAAygEAIZsBQADKAQAhrwEBAMMBACGwAQEAwwEAIbEBAQDEAQAhsgEBAMMBACGzAQEAwwEAIbQBAQDDAQAhtQEBAMMBACG2AQEAwwEAIbcBAQDDAQAhuAEBAMMBACG5AQEAxAEAIboBEADuAQAhuwEQAO8BACG8ARAA7wEAIb0BQADJAQAhvgFAAMkBACG_AUAAyQEAIcABQADJAQAhwQEBAMQBACHCAUAAyQEAIcMBAQDEAQAhAwAAAAUAIAIAAJABADAfAACRAQAgAwAAAAUAIAIAAAYAMAMAAAcAIAEAAAARACABAAAAEQAgAwAAAA8AIAIAABAAMAMAABEAIAMAAAAPACACAAAQADADAAARACADAAAADwAgAgAAEAAwAwAAEQAgCAYAAIUDACCJAQEAAAABkQEAAACsAQKaAUAAAAABqgEBAAAAAawBAQAAAAGtAQEAAAABrgEBAAAAAQETAACZAQAgB4kBAQAAAAGRAQAAAKwBApoBQAAAAAGqAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEAAAABARMAAJsBADABEwAAmwEAMAgGAACEAwAgiQEBAJsCACGRAQAAxgKsASKaAUAAogIAIaoBAQCbAgAhrAEBAJwCACGtAQEAnAIAIa4BAQCcAgAhAgAAABEAIBMAAJ4BACAHiQEBAJsCACGRAQAAxgKsASKaAUAAogIAIaoBAQCbAgAhrAEBAJwCACGtAQEAnAIAIa4BAQCcAgAhAgAAAA8AIBMAAKABACACAAAADwAgEwAAoAEAIAMAAAARACAaAACZAQAgGwAAngEAIAEAAAARACABAAAADwAgBgkAAIEDACAgAACDAwAgIQAAggMAIKwBAACXAgAgrQEAAJcCACCuAQAAlwIAIAqGAQAA6QEAMIcBAACnAQAQiAEAAOkBADCJAQEAwwEAIZEBAADqAawBIpoBQADKAQAhqgEBAMMBACGsAQEAxAEAIa0BAQDEAQAhrgEBAMQBACEDAAAADwAgAgAApgEAMB8AAKcBACADAAAADwAgAgAAEAAwAwAAEQAgFgsAAOYBACAMAADnAQAgDQAA6AEAIIYBAADdAQAwhwEAABsAEIgBAADdAQAwiQEBAAAAAYoBAQDeAQAhiwEBAAAAAYwBAQDfAQAhjQEBAAAAAY8BAADgAY8BIpEBAADhAZEBIpIBIADiAQAhlAEAAOMBlAEilQEBAN4BACGWAQEA3gEAIZcBIADiAQAhmAEgAOIBACGZAUAA5AEAIZoBQADlAQAhmwFAAOUBACEBAAAAqgEAIAEAAACqAQAgBgsAAP4CACAMAAD_AgAgDQAAgAMAIIwBAACXAgAgjQEAAJcCACCZAQAAlwIAIAMAAAAbACACAACtAQAwAwAAqgEAIAMAAAAbACACAACtAQAwAwAAqgEAIAMAAAAbACACAACtAQAwAwAAqgEAIBMLAAD7AgAgDAAA_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_AEAIAoAAP0BACCGAQAA-wEAMIcBAAADABCIAQAA-wEAMIkBAQDeAQAhmgFAAOUBACGbAUAA5QEAIdgBAQDeAQAh2QEBAN4BACHaAQEA3gEAIdsBAQDeAQAh7AEAAAMAIO0BAAADACAWAQAA_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-gEAMIcBAABjABCIAQAA-gEAMIkBAQDDAQAhmgFAAMoBACGbAUAAygEAIdgBAQDDAQAh2QEBAMMBACHaAQEAwwEAIdsBAQDDAQAhDAEAAPwBACAKAAD9AQAghgEAAPsBADCHAQAAAwAQiAEAAPsBADCJAQEA3gEAIZoBQADlAQAhmwFAAOUBACHYAQEA3gEAIdkBAQDeAQAh2gEBAN4BACHbAQEA3gEAIRgLAADmAQAgDAAA5wEAIA0AAOgBACCGAQAA3QEAMIcBAAAbABCIAQAA3QEAMIkBAQDeAQAhigEBAN4BACGLAQEA3gEAIYwBAQDfAQAhjQEBAN8BACGPAQAA4AGPASKRAQAA4QGRASKSASAA4gEAIZQBAADjAZQBIpUBAQDeAQAhlgEBAN4BACGXASAA4gEAIZgBIADiAQAhmQFAAOQBACGaAUAA5QEAIZsBQADlAQAh7AEAABsAIO0BAAAbACADpwEAAAUAIKgBAAAFACCpAQAABQAgCoYBAAD-AQAwhwEAAEsAEIgBAAD-AQAwiQEBAMMBACGaAUAAygEAIdsBAQDEAQAh3AEBAMMBACHdAQEAwwEAId4BAQDEAQAh3wEAAPYBACAShgEAAP8BADCHAQAAMwAQiAEAAP8BADCJAQEAwwEAIZEBAACBAuYBIpoBQADKAQAhmwFAAMoBACHbAQEAwwEAIeABAQDDAQAh4QEBAMMBACHjAQAAgALjASLkAQEAwwEAIeYBIADHAQAh5wFAAMkBACHoAUAAyQEAIekBAQDEAQAh6gEBAMQBACHrAUAAyQEAIQcJAADMAQAgIAAAhQIAICEAAIUCACCcAQAAAOMBAp0BAAAA4wEIngEAAADjAQijAQAAhALjASIHCQAAzAEAICAAAIMCACAhAACDAgAgnAEAAADmAQKdAQAAAOYBCJ4BAAAA5gEIowEAAIIC5gEiBwkAAMwBACAgAACDAgAgIQAAgwIAIJwBAAAA5gECnQEAAADmAQieAQAAAOYBCKMBAACCAuYBIgScAQAAAOYBAp0BAAAA5gEIngEAAADmAQijAQAAgwLmASIHCQAAzAEAICAAAIUCACAhAACFAgAgnAEAAADjAQKdAQAAAOMBCJ4BAAAA4wEIowEAAIQC4wEiBJwBAAAA4wECnQEAAADjAQieAQAAAOMBCKMBAACFAuMBIgsBAACIAgAghgEAAIYCADCHAQAAFwAQiAEAAIYCADCJAQEA3gEAIZoBQADlAQAh2wEBAN8BACHcAQEA3gEAId0BAQDeAQAh3gEBAN8BACHfAQAAhwIAIAycAYAAAAABnwGAAAAAAaABgAAAAAGhAYAAAAABogGAAAAAAaMBgAAAAAHSAQEAAAAB0wEBAAAAAdQBAQAAAAHVAYAAAAAB1gGAAAAAAdcBgAAAAAEYCwAA5gEAIAwAAOcBACANAADoAQAghgEAAN0BADCHAQAAGwAQiAEAAN0BADCJAQEA3gEAIYoBAQDeAQAhiwEBAN4BACGMAQEA3wEAIY0BAQDfAQAhjwEAAOABjwEikQEAAOEBkQEikgEgAOIBACGUAQAA4wGUASKVAQEA3gEAIZYBAQDeAQAhlwEgAOIBACGYASAA4gEAIZkBQADkAQAhmgFAAOUBACGbAUAA5QEAIewBAAAbACDtAQAAGwAgCwYAAIsCACCGAQAAiQIAMIcBAAAPABCIAQAAiQIAMIkBAQDeAQAhkQEAAIoCrAEimgFAAOUBACGqAQEA3gEAIawBAQDfAQAhrQEBAN8BACGuAQEA3wEAIQScAQAAAKwBAp0BAAAArAEIngEAAACsAQijAQAA7AGsASIiBAAAlAIAIAUAAOcBACAHAACVAgAgCAAAlgIAIIYBAACTAgAwhwEAAAUAEIgBAACTAgAwiQEBAN4BACGRAQAAigKsASKaAUAA5QEAIZsBQADlAQAhrwEBAN4BACGwAQEA3gEAIbEBAQDfAQAhsgEBAN4BACGzAQEA3gEAIbQBAQDeAQAhtQEBAN4BACG2AQEA3gEAIbcBAQDeAQAhuAEBAN4BACG5AQEA3wEAIboBEACPAgAhuwEQAI4CACG8ARAAjgIAIb0BQADkAQAhvgFAAOQBACG_AUAA5AEAIcABQADkAQAhwQEBAN8BACHCAUAA5AEAIcMBAQDfAQAh7AEAAAUAIO0BAAAFACAWBgAAiwIAIIYBAACMAgAwhwEAAAsAEIgBAACMAgAwiQEBAN4BACGRAQAAjQLFASKaAUAA5QEAIZsBQADlAQAhqgEBAN4BACHFAQEA3gEAIcYBEACOAgAhxwEBAN4BACHIAQEA3gEAIckBAQDfAQAhygEBAN8BACHLAQEA3wEAIcwBQADkAQAhzQEAAIcCACDOAQEA3wEAIc8BEACPAgAh0AEBAN8BACHRAUAA5AEAIQScAQAAAMUBAp0BAAAAxQEIngEAAADFAQijAQAA-QHFASIInAEQAAAAAZ0BEAAAAASeARAAAAAEnwEQAAAAAaABEAAAAAGhARAAAAABogEQAAAAAaMBEADxAQAhCJwBEAAAAAGdARAAAAAFngEQAAAABZ8BEAAAAAGgARAAAAABoQEQAAAAAaIBEAAAAAGjARAA8wEAIRQBAAD8AQAgCgAA_QEAIIYBAACQAgAwhwEAAAkAEIgBAACQAgAwiQEBAN4BACGRAQAAkgLmASKaAUAA5QEAIZsBQADlAQAh2wEBAN4BACHgAQEA3gEAIeEBAQDeAQAh4wEAAJEC4wEi5AEBAN4BACHmASAA4gEAIecBQADkAQAh6AFAAOQBACHpAQEA3wEAIeoBAQDfAQAh6wFAAOQBACEEnAEAAADjAQKdAQAAAOMBCJ4BAAAA4wEIowEAAIUC4wEiBJwBAAAA5gECnQEAAADmAQieAQAAAOYBCKMBAACDAuYBIiAEAACUAgAgBQAA5wEAIAcAAJUCACAIAACWAgAghgEAAJMCADCHAQAABQAQiAEAAJMCADCJAQEA3gEAIZEBAACKAqwBIpoBQADlAQAhmwFAAOUBACGvAQEA3gEAIbABAQDeAQAhsQEBAN8BACGyAQEA3gEAIbMBAQDeAQAhtAEBAN4BACG1AQEA3gEAIbYBAQDeAQAhtwEBAN4BACG4AQEA3gEAIbkBAQDfAQAhugEQAI8CACG7ARAAjgIAIbwBEACOAgAhvQFAAOQBACG-AUAA5AEAIb8BQADkAQAhwAFAAOQBACHBAQEA3wEAIcIBQADkAQAhwwEBAN8BACEOAQAA_AEAIAoAAP0BACCGAQAA-wEAMIcBAAADABCIAQAA-wEAMIkBAQDeAQAhmgFAAOUBACGbAUAA5QEAIdgBAQDeAQAh2QEBAN4BACHaAQEA3gEAIdsBAQDeAQAh7AEAAAMAIO0BAAADACADpwEAAAsAIKgBAAALACCpAQAACwAgA6cBAAAPACCoAQAADwAgqQEAAA8AIAAAAAAB8QEBAAAAAQHxAQEAAAABAfEBAAAAjwECAfEBAAAAkQECAfEBIAAAAAEB8QEAAACUAQIB8QFAAAAAAQHxAUAAAAABBxoAAOkCACAbAADsAgAg7gEAAOoCACDvAQAA6wIAIPIBAAADACDzAQAAAwAg9AEAAE4AIAcaAACyAgAgGwAAtQIAIO4BAACzAgAg7wEAALQCACDyAQAACQAg8wEAAAkAIPQBAAABACALGgAApgIAMBsAAKsCADDuAQAApwIAMO8BAACoAgAw8AEAAKkCACDxAQAAqgIAMPIBAACqAgAw8wEAAKoCADD0AQAAqgIAMPUBAACsAgAw9gEAAK0CADAGiQEBAAAAAZoBQAAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAYAAAAABAgAAABkAIBoAALECACADAAAAGQAgGgAAsQIAIBsAALACACABEwAAzQMAMAsBAACIAgAghgEAAIYCADCHAQAAFwAQiAEAAIYCADCJAQEAAAABmgFAAOUBACHbAQEA3wEAIdwBAQDeAQAh3QEBAN4BACHeAQEA3wEAId8BAACHAgAgAgAAABkAIBMAALACACACAAAArgIAIBMAAK8CACAKhgEAAK0CADCHAQAArgIAEIgBAACtAgAwiQEBAN4BACGaAUAA5QEAIdsBAQDfAQAh3AEBAN4BACHdAQEA3gEAId4BAQDfAQAh3wEAAIcCACAKhgEAAK0CADCHAQAArgIAEIgBAACtAgAwiQEBAN4BACGaAUAA5QEAIdsBAQDfAQAh3AEBAN4BACHdAQEA3gEAId4BAQDfAQAh3wEAAIcCACAGiQEBAJsCACGaAUAAogIAIdwBAQCbAgAh3QEBAJsCACHeAQEAnAIAId8BgAAAAAEGiQEBAJsCACGaAUAAogIAIdwBAQCbAgAh3QEBAJsCACHeAQEAnAIAId8BgAAAAAEGiQEBAAAAAZoBQAAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAYAAAAABDwoAAOgCACCJAQEAAAABkQEAAADmAQKaAUAAAAABmwFAAAAAAeABAQAAAAHhAQEAAAAB4wEAAADjAQLkAQEAAAAB5gEgAAAAAecBQAAAAAHoAUAAAAAB6QEBAAAAAeoBAQAAAAHrAUAAAAABAgAAAAEAIBoAALICACADAAAACQAgGgAAsgIAIBsAALYCACARAAAACQAgCgAAuQIAIBMAALYCACCJAQEAmwIAIZEBAAC4AuYBIpoBQACiAgAhmwFAAKICACHgAQEAmwIAIeEBAQCbAgAh4wEAALcC4wEi5AEBAJsCACHmASAAnwIAIecBQAChAgAh6AFAAKECACHpAQEAnAIAIeoBAQCcAgAh6wFAAKECACEPCgAAuQIAIIkBAQCbAgAhkQEAALgC5gEimgFAAKICACGbAUAAogIAIeABAQCbAgAh4QEBAJsCACHjAQAAtwLjASLkAQEAmwIAIeYBIACfAgAh5wFAAKECACHoAUAAoQIAIekBAQCcAgAh6gEBAJwCACHrAUAAoQIAIQHxAQAAAOMBAgHxAQAAAOYBAgsaAAC6AgAwGwAAvwIAMO4BAAC7AgAw7wEAALwCADDwAQAAvQIAIPEBAAC-AgAw8gEAAL4CADDzAQAAvgIAMPQBAAC-AgAw9QEAAMACADD2AQAAwQIAMBsEAADlAgAgBwAA5gIAIAgAAOcCACCJAQEAAAABkQEAAACsAQKaAUAAAAABmwFAAAAAAa8BAQAAAAGwAQEAAAABsgEBAAAAAbMBAQAAAAG0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAAAAAbkBAQAAAAG6ARAAAAABuwEQAAAAAbwBEAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABwQEBAAAAAcIBQAAAAAHDAQEAAAABAgAAAAcAIBoAAOQCACADAAAABwAgGgAA5AIAIBsAAMcCACABEwAAzAMAMCAEAACUAgAgBQAA5wEAIAcAAJUCACAIAACWAgAghgEAAJMCADCHAQAABQAQiAEAAJMCADCJAQEAAAABkQEAAIoCrAEimgFAAOUBACGbAUAA5QEAIa8BAQAAAAGwAQEA3gEAIbEBAQDfAQAhsgEBAN4BACGzAQEA3gEAIbQBAQDeAQAhtQEBAN4BACG2AQEA3gEAIbcBAQDeAQAhuAEBAN4BACG5AQEA3wEAIboBEACPAgAhuwEQAI4CACG8ARAAjgIAIb0BQADkAQAhvgFAAOQBACG_AUAA5AEAIcABQADkAQAhwQEBAN8BACHCAUAA5AEAIcMBAQDfAQAhAgAAAAcAIBMAAMcCACACAAAAwgIAIBMAAMMCACAchgEAAMECADCHAQAAwgIAEIgBAADBAgAwiQEBAN4BACGRAQAAigKsASKaAUAA5QEAIZsBQADlAQAhrwEBAN4BACGwAQEA3gEAIbEBAQDfAQAhsgEBAN4BACGzAQEA3gEAIbQBAQDeAQAhtQEBAN4BACG2AQEA3gEAIbcBAQDeAQAhuAEBAN4BACG5AQEA3wEAIboBEACPAgAhuwEQAI4CACG8ARAAjgIAIb0BQADkAQAhvgFAAOQBACG_AUAA5AEAIcABQADkAQAhwQEBAN8BACHCAUAA5AEAIcMBAQDfAQAhHIYBAADBAgAwhwEAAMICABCIAQAAwQIAMIkBAQDeAQAhkQEAAIoCrAEimgFAAOUBACGbAUAA5QEAIa8BAQDeAQAhsAEBAN4BACGxAQEA3wEAIbIBAQDeAQAhswEBAN4BACG0AQEA3gEAIbUBAQDeAQAhtgEBAN4BACG3AQEA3gEAIbgBAQDeAQAhuQEBAN8BACG6ARAAjwIAIbsBEACOAgAhvAEQAI4CACG9AUAA5AEAIb4BQADkAQAhvwFAAOQBACHAAUAA5AEAIcEBAQDfAQAhwgFAAOQBACHDAQEA3wEAIRiJAQEAmwIAIZEBAADGAqwBIpoBQACiAgAhmwFAAKICACGvAQEAmwIAIbABAQCbAgAhsgEBAJsCACGzAQEAmwIAIbQBAQCbAgAhtQEBAJsCACG2AQEAmwIAIbcBAQCbAgAhuAEBAJsCACG5AQEAnAIAIboBEADEAgAhuwEQAMUCACG8ARAAxQIAIb0BQAChAgAhvgFAAKECACG_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_AUAAAAABwAFAAAAAAcEBAQAAAAHCAUAAAAABwwEBAAAAAQIAAAAHACAaAAD4AgAgAwAAAAcAIBoAAPgCACAbAAD2AgAgARMAAMQDADACAAAABwAgEwAA9gIAIAIAAADCAgAgEwAA9QIAIBiJAQEAmwIAIZEBAADGAqwBIpoBQACiAgAhmwFAAKICACGvAQEAmwIAIbEBAQCcAgAhsgEBAJsCACGzAQEAmwIAIbQBAQCbAgAhtQEBAJsCACG2AQEAmwIAIbcBAQCbAgAhuAEBAJsCACG5AQEAnAIAIboBEADEAgAhuwEQAMUCACG8ARAAxQIAIb0BQAChAgAhvgFAAKECACG_AUAAoQIAIcABQAChAgAhwQEBAJwCACHCAUAAoQIAIcMBAQCcAgAhGwUAAPcCACAHAADJAgAgCAAAygIAIIkBAQCbAgAhkQEAAMYCrAEimgFAAKICACGbAUAAogIAIa8BAQCbAgAhsQEBAJwCACGyAQEAmwIAIbMBAQCbAgAhtAEBAJsCACG1AQEAmwIAIbYBAQCbAgAhtwEBAJsCACG4AQEAmwIAIbkBAQCcAgAhugEQAMQCACG7ARAAxQIAIbwBEADFAgAhvQFAAKECACG-AUAAoQIAIb8BQAChAgAhwAFAAKECACHBAQEAnAIAIcIBQAChAgAhwwEBAJwCACEHGgAAvwMAIBsAAMIDACDuAQAAwAMAIO8BAADBAwAg8gEAAAkAIPMBAAAJACD0AQAAAQAgGwUAAPkCACAHAADmAgAgCAAA5wIAIIkBAQAAAAGRAQAAAKwBApoBQAAAAAGbAUAAAAABrwEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABuQEBAAAAAboBEAAAAAG7ARAAAAABvAEQAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAHBAQEAAAABwgFAAAAAAcMBAQAAAAEDGgAAvwMAIO4BAADAAwAg9AEAAAEAIAQaAADvAgAw7gEAAPACADDwAQAA8gIAIPQBAAC-AgAwAxoAAOkCACDuAQAA6gIAIPQBAABOACADGgAAsgIAIO4BAACzAgAg9AEAAAEAIAQaAACmAgAw7gEAAKcCADDwAQAAqQIAIPQBAACqAgAwAgEAAJcDACAKAACYAwAgBwEAAJcDACAKAACYAwAg5wEAAJcCACDoAQAAlwIAIOkBAACXAgAg6gEAAJcCACDrAQAAlwIAIAAAAAAFGgAAugMAIBsAAL0DACDuAQAAuwMAIO8BAAC8AwAg9AEAAAcAIAMaAAC6AwAg7gEAALsDACD0AQAABwAgAAAAAAAAAAAAAAUaAAC1AwAgGwAAuAMAIO4BAAC2AwAg7wEAALcDACD0AQAABwAgAxoAALUDACDuAQAAtgMAIPQBAAAHACAAAAAFGgAAsAMAIBsAALMDACDuAQAAsQMAIO8BAACyAwAg9AEAAKoBACADGgAAsAMAIO4BAACxAwAg9AEAAKoBACAGCwAA_gIAIAwAAP8CACANAACAAwAgjAEAAJcCACCNAQAAlwIAIJkBAACXAgAgAAAAAAcaAACrAwAgGwAArgMAIO4BAACsAwAg7wEAAK0DACDyAQAAGwAg8wEAABsAIPQBAACqAQAgAxoAAKsDACDuAQAArAMAIPQBAACqAQAgAAAABRoAAKYDACAbAACpAwAg7gEAAKcDACDvAQAAqAMAIPQBAACqAQAgAxoAAKYDACDuAQAApwMAIPQBAACqAQAgDgQAAP4CACAFAAD_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AKICACGbAUAAogIAIa8BAQCbAgAhsAEBAJsCACGxAQEAnAIAIbIBAQCbAgAhswEBAJsCACG0AQEAmwIAIbUBAQCbAgAhtgEBAJsCACG3AQEAmwIAIbgBAQCbAgAhuQEBAJwCACG6ARAAxAIAIbsBEADFAgAhvAEQAMUCACG9AUAAoQIAIb4BQAChAgAhvwFAAKECACHAAUAAoQIAIcEBAQCcAgAhwgFAAKECACHDAQEAnAIAIRwEAADIAgAgBQAA9wIAIAgAAMoCACCJAQEAmwIAIZEBAADGAqwBIpoBQACiAgAhmwFAAKICACGvAQEAmwIAIbABAQCbAgAhsQEBAJwCACGyAQEAmwIAIbMBAQCbAgAhtAEBAJsCACG1AQEAmwIAIbYBAQCbAgAhtwEBAJsCACG4AQEAmwIAIbkBAQCcAgAhugEQAMQCACG7ARAAxQIAIbwBEADFAgAhvQFAAKECACG-AUAAoQIAIb8BQAChAgAhwAFAAKECACHBAQEAnAIAIcIBQAChAgAhwwEBAJwCACEcBAAA5QIAIAUAAPkCACAHAADmAgAgiQEBAAAAAZEBAAAArAECmgFAAAAAAZsBQAAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABuQEBAAAAAboBEAAAAAG7ARAAAAABvAEQAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAHBAQEAAAABwgFAAAAAAcMBAQAAAAECAAAABwAgGgAAugMAIAMAAAAFACAaAAC6AwAgGwAAvgMAIB4AAAAFACAEAADIAgAgBQAA9wIAIAcAAMkCACATAAC-AwAgiQEBAJsCACGRAQAAxgKsASKaAUAAogIAIZsBQACiAgAhrwEBAJsCACGwAQEAmwIAIbEBAQCcAgAhsgEBAJsCACGzAQEAmwIAIbQBAQCbAgAhtQEBAJsCACG2AQEAmwIAIbcBAQCbAgAhuAEBAJsCACG5AQEAnAIAIboBEADEAgAhuwEQAMUCACG8ARAAxQIAIb0BQAChAgAhvgFAAKECACG_AUAAoQIAIcABQAChAgAhwQEBAJwCACHCAUAAoQIAIcMBAQCcAgAhHAQAAMgCACAFAAD3AgAgBwAAyQIAIIkBAQCbAgAhkQEAAMYCrAEimgFAAKICACGbAUAAogIAIa8BAQCbAgAhsAEBAJsCACGxAQEAnAIAIbIBAQCbAgAhswEBAJsCACG0AQEAmwIAIbUBAQCbAgAhtgEBAJsCACG3AQEAmwIAIbgBAQCbAgAhuQEBAJwCACG6ARAAxAIAIbsBEADFAgAhvAEQAMUCACG9AUAAoQIAIb4BQAChAgAhvwFAAKECACHAAUAAoQIAIcEBAQCcAgAhwgFAAKECACHDAQEAnAIAIRABAACiAwAgiQEBAAAAAZEBAAAA5gECmgFAAAAAAZsBQAAAAAHbAQEAAAAB4AEBAAAAAeEBAQAAAAHjAQAAAOMBAuQBAQAAAAHmASAAAAAB5wFAAAAAAegBQAAAAAHpAQEAAAAB6gEBAAAAAesBQAAAAAECAAAAAQAgGgAAvwMAIAMAAAAJACAaAAC_AwAgGwAAwwMAIBIAAAAJACABAAChAwAgEwAAwwMAIIkBAQCbAgAhkQEAALgC5gEimgFAAKICACGbAUAAogIAIdsBAQCbAgAh4AEBAJsCACHhAQEAmwIAIeMBAAC3AuMBIuQBAQCbAgAh5gEgAJ8CACHnAUAAoQIAIegBQAChAgAh6QEBAJwCACHqAQEAnAIAIesBQAChAgAhEAEAAKEDACCJAQEAmwIAIZEBAAC4AuYBIpoBQACiAgAhmwFAAKICACHbAQEAmwIAIeABAQCbAgAh4QEBAJsCACHjAQAAtwLjASLkAQEAmwIAIeYBIACfAgAh5wFAAKECACHoAUAAoQIAIekBAQCcAgAh6gEBAJwCACHrAUAAoQIAIRiJAQEAAAABkQEAAACsAQKaAUAAAAABmwFAAAAAAa8BAQAAAAGxAQEAAAABsgEBAAAAAbMBAQAAAAG0AQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAAAAAbkBAQAAAAG6ARAAAAABuwEQAAAAAbwBEAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABwQEBAAAAAcIBQAAAAAHDAQEAAAABCAEAAJYDACCJAQEAAAABmgFAAAAAAZsBQAAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAABAgAAAE4AIBoAAMUDACARiQEBAAAAAZEBAAAAxQECmgFAAAAAAZsBQAAAAAHFAQEAAAABxgEQAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAFAAAAAAc0BgAAAAAHOAQEAAAABzwEQAAAAAdABAQAAAAHRAUAAAAABBokBAQAAAAGRAQAAAKwBApoBQAAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAEDAAAAAwAgGgAAxQMAIBsAAMsDACAKAAAAAwAgAQAAlQMAIBMAAMsDACCJAQEAmwIAIZoBQACiAgAhmwFAAKICACHYAQEAmwIAIdkBAQCbAgAh2gEBAJsCACHbAQEAmwIAIQgBAACVAwAgiQEBAJsCACGaAUAAogIAIZsBQACiAgAh2AEBAJsCACHZAQEAmwIAIdoBAQCbAgAh2wEBAJsCACEYiQEBAAAAAZEBAAAArAECmgFAAAAAAZsBQAAAAAGvAQEAAAABsAEBAAAAAbIBAQAAAAGzAQEAAAABtAEBAAAAAbUBAQAAAAG2AQEAAAABtwEBAAAAAbgBAQAAAAG5AQEAAAABugEQAAAAAbsBEAAAAAG8ARAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHCAUAAAAABwwEBAAAAAQaJAQEAAAABmgFAAAAAAdwBAQAAAAHdAQEAAAAB3gEBAAAAAd8BgAAAAAEDAQACCQALCh4EBAkACgsEAwwWAQ0aCQMBAAIJAAgKCAQFBAADBQoBBw4FCBIGCQAHAQYABAEGAAQCBxMACBQAAQoVAAEBHAIBDR0AAQofAAABAQACAQEAAgMJABAgABEhABIAAAADCQAQIAARIQASAQFAAgEBRgIDCQAXIAAYIQAZAAAAAwkAFyAAGCEAGQEBAAIBAQACAwkAHiAAHyEAIAAAAAMJAB4gAB8hACABBgAEAQYABAUJACUgACghAClSACZTACcAAAAAAAUJACUgACghAClSACZTACcCBAADBYYBAQIEAAMFjAEBBQkALiAAMSEAMlIAL1MAMAAAAAAABQkALiAAMSEAMlIAL1MAMAEGAAQBBgAEAwkANyAAOCEAOQAAAAMJADcgADghADkAAAMJAD4gAD8hAEAAAAADCQA-IAA_IQBADgIBDyABECIBESMBEiQBFCYBFSgMFikNFysBGC0MGS4OHC8BHTABHjEMIjQPIzUTJDYJJTcJJjgJJzkJKDoJKTwJKj4MKz8ULEIJLUQMLkUVL0cJMEgJMUkMMkwWM00aNE8DNVADNlIDN1MDOFQDOVYDOlgMO1kbPFsDPV0MPl4cP18DQGADQWEMQmQdQ2UhRGYFRWcFRmgFR2kFSGoFSWwFSm4MS28iTHEFTXMMTnQjT3UFUHYFUXcMVHokVXsqVnwEV30EWH4EWX8EWoABBFuCAQRchAEMXYUBK16IAQRfigEMYIsBLGGNAQRijgEEY48BDGSSAS1lkwEzZpQBBmeVAQZolgEGaZcBBmqYAQZrmgEGbJwBDG2dATRunwEGb6EBDHCiATVxowEGcqQBBnOlAQx0qAE2dakBOnarAQJ3rAECeK4BAnmvAQJ6sAECe7IBAny0AQx9tQE7frcBAn-5AQyAAboBPIEBuwECggG8AQKDAb0BDIQBwAE9hQHBAUE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  AuditLogScalarFieldEnum: () => AuditLogScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MerchantProfileScalarFieldEnum: () => MerchantProfileScalarFieldEnum,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RiderProfileScalarFieldEnum: () => RiderProfileScalarFieldEnum,
  ShipmentScalarFieldEnum: () => ShipmentScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TrackingEventScalarFieldEnum: () => TrackingEventScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.10.0",
  engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  RiderProfile: "RiderProfile",
  AuditLog: "AuditLog",
  MerchantProfile: "MerchantProfile",
  Payment: "Payment",
  Shipment: "Shipment",
  TrackingEvent: "TrackingEvent",
  User: "User"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var RiderProfileScalarFieldEnum = {
  id: "id",
  phone: "phone",
  address: "address",
  vehicleType: "vehicleType",
  licenseNumber: "licenseNumber",
  status: "status",
  userId: "userId",
  isSuspended: "isSuspended",
  sespendedAt: "sespendedAt",
  rejectedAt: "rejectedAt",
  rejectionReason: "rejectionReason",
  reviewedBy: "reviewedBy",
  reviewedAt: "reviewedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AuditLogScalarFieldEnum = {
  id: "id",
  userId: "userId",
  action: "action",
  entity: "entity",
  entityId: "entityId",
  metadata: "metadata",
  createdAt: "createdAt"
};
var MerchantProfileScalarFieldEnum = {
  id: "id",
  businessName: "businessName",
  businessPhone: "businessPhone",
  businessAddress: "businessAddress",
  userId: "userId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  status: "status",
  currency: "currency",
  amount: "amount",
  paymentGateway: "paymentGateway",
  merchantInvoiceNumber: "merchantInvoiceNumber",
  bkashPaymentId: "bkashPaymentId",
  bkashTrxId: "bkashTrxId",
  payerReference: "payerReference",
  paidAt: "paidAt",
  gatewayResponse: "gatewayResponse",
  refundTrxId: "refundTrxId",
  refundAmount: "refundAmount",
  refundReason: "refundReason",
  refundAt: "refundAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  shipmentId: "shipmentId"
};
var ShipmentScalarFieldEnum = {
  id: "id",
  trackingId: "trackingId",
  merchantId: "merchantId",
  riderId: "riderId",
  senderName: "senderName",
  senderPhone: "senderPhone",
  senderAddress: "senderAddress",
  recipientName: "recipientName",
  recipientPhone: "recipientPhone",
  recipientAddress: "recipientAddress",
  parcelType: "parcelType",
  parcelDescription: "parcelDescription",
  weight: "weight",
  deliveryFee: "deliveryFee",
  codAmount: "codAmount",
  status: "status",
  assignedAt: "assignedAt",
  pickedUpAt: "pickedUpAt",
  deliveredAt: "deliveredAt",
  deliveryFailedAt: "deliveryFailedAt",
  failureReason: "failureReason",
  cancelledAt: "cancelledAt",
  cancellationReason: "cancellationReason",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TrackingEventScalarFieldEnum = {
  id: "id",
  shipmentId: "shipmentId",
  status: "status",
  location: "location",
  description: "description",
  updatedBy: "updatedBy",
  createdAt: "createdAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  password: "password",
  googleId: "googleId",
  role: "role",
  status: "status",
  emailVerified: "emailVerified",
  authProvider: "authProvider",
  imageUrl: "imageUrl",
  imagePublicId: "imagePublicId",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var UserRole = {
  MERCHANT: "MERCHANT",
  RIDER: "RIDER",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED"
};
var RiderStatus = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED"
};
var AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIAL: "CREDENTIAL"
};
var ShipmentStatus = {
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  ASSIGNED: "ASSIGNED",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED"
};
var PaymentStatus = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};
var AppError_default = AppError;

// src/app/module/auth/auth.service.ts
import httpstatus from "http-status";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// src/app/lib/redis.ts
import { createClient } from "redis";
var redisClient = createClient({
  username: config_default.redis_username,
  password: config_default.redis_password,
  socket: {
    host: config_default.redis_host,
    port: Number(config_default.redis_port)
  }
});
var redis_default = redisClient;

// src/app/module/auth/auth.service.ts
import path3 from "path";

// src/app/lib/nodemailer.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config_default.smtp_user,
    pass: config_default.smtp_password
  }
});
var nodemailer_default = transporter;

// src/app/module/auth/auth.service.ts
import ejs from "ejs";

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, {
    expiresIn
  });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/app/lib/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client({
  client_id: config_default.google_client_id
});
var googleAuth_default = googleClient;

// src/app/module/auth/auth.service.ts
var registerMerchant = async (payload) => {
  const {
    name,
    email,
    password,
    businessName,
    businessAddress,
    businessPhone
  } = payload;
  const isUserExists = await prisma.user.findUnique({
    where: { email }
  });
  if (isUserExists) {
    throw new AppError_default(
      httpstatus.CONFLICT,
      "User with this email already exists"
    );
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config_default.bcrypt_salt_rounds)
  );
  const expiresInSeconds = 5 * 60;
  const otpKey = `merchant-register-otp:${email}`;
  const otpValue = crypto.randomInt(1e5, 1e6).toString();
  await redis_default.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expiresInSeconds
    }
  });
  const merchantRegisterkey = `merchant-register-data:${email}`;
  const merchantRegisterData = {
    name,
    email,
    password: hashedPassword,
    businessName,
    businessPhone,
    businessAddress
  };
  await redis_default.set(
    merchantRegisterkey,
    JSON.stringify(merchantRegisterData),
    {
      expiration: {
        type: "EX",
        value: expiresInSeconds
      }
    }
  );
  const templatePath = path3.join(
    process.cwd(),
    "src/app/template/merchantRegisterOTP.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name,
    otpValue,
    expiresIn: expiresInSeconds / 60,
    year: (/* @__PURE__ */ new Date()).getFullYear()
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: email,
    subject: "Email Verification OTP Send.",
    html
  });
};
var verifyMerchantEmail = async (payload) => {
  const { otp, email } = payload;
  const otpKey = `merchant-register-otp:${email}`;
  const redisOtp = await redis_default.get(otpKey);
  if (!redisOtp) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Invalid Otp");
  }
  if (redisOtp !== otp) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Otp does not match");
  }
  await redis_default.del(otpKey);
  const merchantRegisterkey = `merchant-register-data:${email}`;
  const redisMerchantData = await redis_default.get(merchantRegisterkey);
  if (!redisMerchantData) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User Does Not Exists");
  }
  const merchantPayload = JSON.parse(redisMerchantData);
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
          businessAddress: merchantPayload.businessAddress
        }
      }
    },
    omit: { password: true },
    include: { merchantProfile: true }
  });
  await redis_default.del(merchantRegisterkey);
  const templatePath = path3.join(
    process.cwd(),
    "src/app/template/SwiftDrop-WelcomeEmail.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name: merchantPayload.name
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: email,
    subject: "Welcome to SwiftDrop",
    html
  });
  const { merchantProfile, ...user } = createdUser;
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    user,
    merchantProfile,
    accessToken,
    refreshToken: refreshToken3
  };
};
var loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (!user) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User not found");
  }
  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError_default(httpstatus.FORBIDDEN, "User is suspensed");
  }
  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "User is deleted");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new AppError_default(httpstatus.UNAUTHORIZED, "Invalid credentials");
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3
  };
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      merchantProfile: true,
      riderProfile: true
    },
    omit: {
      password: true
    }
  });
  if (!isUserExists) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var refreshToken = async (token) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    token,
    config_default.jwt_refresh_secret
  );
  if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
    throw new AppError_default(httpstatus.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const user = await prisma.user.findUnique({
    where: { id: data.userId }
  });
  if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
    throw new AppError_default(
      httpstatus.UNAUTHORIZED,
      "User is inactive or not found"
    );
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3
  };
};
var forgotPassword = async (payload) => {
  const { email } = payload;
  const isForgotUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isForgotUserExist) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User does not exists");
  }
  if (!isForgotUserExist.emailVerified) {
    throw new AppError_default(httpstatus.FORBIDDEN, "User Is Not Varified");
  }
  if (isForgotUserExist.status === "SUSPENDED") {
    throw new AppError_default(httpstatus.FORBIDDEN, "User is Suspended");
  }
  if (isForgotUserExist.status !== "ACTIVE") {
    throw new AppError_default(httpstatus.FORBIDDEN, "User is Suspended");
  }
  if (isForgotUserExist.isDeleted) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User Is Deleted");
  }
  if (isForgotUserExist.googleId && isForgotUserExist.authProvider === "GOOGLE") {
    throw new AppError_default(httpstatus.BAD_REQUEST, "User Has Account With Google");
  }
  const expiresInSecend = 5 * 60;
  const otp = crypto.randomInt(1e5, 1e6).toString();
  const key = `forgot-password-otp:${isForgotUserExist.email}`;
  await redis_default.set(key, otp, {
    expiration: {
      type: "EX",
      value: expiresInSecend
    }
  });
  const templatePath = path3.join(
    process.cwd(),
    "src/app/template/SwiftDrop-ForgotPasswordEmail.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name: isForgotUserExist.name,
    otpValue: otp,
    expiresIn: expiresInSecend / 60
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: isForgotUserExist.email,
    subject: "Reset Your SwiftDrop Password",
    html
  });
};
var resetPassword = async (payload) => {
  const { otp, newPassword, email } = payload;
  const isResetUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isResetUserExist) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User does not exists");
  }
  if (!isResetUserExist.emailVerified) {
    throw new AppError_default(httpstatus.FORBIDDEN, "User Is Not Varified");
  }
  if (isResetUserExist.status === "SUSPENDED") {
    throw new AppError_default(httpstatus.FORBIDDEN, "User is Suspended");
  }
  if (isResetUserExist.isDeleted || isResetUserExist.status === "DELETED") {
    throw new AppError_default(httpstatus.NOT_FOUND, "User Is Deleted");
  }
  if (isResetUserExist.googleId && isResetUserExist.authProvider === "GOOGLE") {
    throw new AppError_default(httpstatus.BAD_REQUEST, "User Has Account With Google");
  }
  const key = `forgot-password-otp:${isResetUserExist.email}`;
  const redisOtp = await redis_default.get(key);
  if (!redisOtp) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Invalid Otp");
  }
  if (redisOtp !== otp) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Otp does not match");
  }
  await redis_default.del(key);
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config_default.bcrypt_salt_rounds)
  );
  await prisma.user.update({
    where: {
      email: isResetUserExist.email
    },
    data: {
      password: hashPassword
    }
  });
  const templatePath = path3.join(
    process.cwd(),
    "src/app/template/SwiftDrop-PasswordResetSuccess.ejs"
  );
  const html = await ejs.renderFile(templatePath, {
    name: isResetUserExist.name
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: isResetUserExist.email,
    subject: "Your SwiftDrop Password Was Reset",
    html
  });
};
var googleLogin = async (payload) => {
  let googleIdTokenPayload = null;
  try {
    const ticket = await googleAuth_default.verifyIdToken({
      idToken: payload.idToken,
      audience: config_default.google_client_id
    });
    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.log("Google Id Token Varified Failed", error);
    throw new AppError_default(
      httpstatus.UNAUTHORIZED,
      "Invalid Or Expired Google Id Token"
    );
  }
  if (!googleIdTokenPayload) {
    throw new AppError_default(
      httpstatus.UNAUTHORIZED,
      "Invalid Or Expired Google Id Token"
    );
  }
  if (!googleIdTokenPayload.email) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Google User Email Not Found");
  }
  if (!googleIdTokenPayload.name) {
    throw new AppError_default(httpstatus.BAD_REQUEST, "Google User Name Not Found");
  }
  if (googleIdTokenPayload.email_verified !== true) {
    throw new AppError_default(httpstatus.UNAUTHORIZED, "Google email is not verified");
  }
  const isMerchantExistWithGoogleAuth = await prisma.user.findUnique({
    where: {
      email: googleIdTokenPayload.email,
      role: UserRole.MERCHANT,
      googleId: googleIdTokenPayload.sub
    }
  });
  let user = isMerchantExistWithGoogleAuth;
  if (!isMerchantExistWithGoogleAuth) {
    const isMerchantExistWithCredential = await prisma.user.findUnique({
      where: {
        email: googleIdTokenPayload.email,
        role: UserRole.MERCHANT,
        authProvider: AuthProvider.CREDENTIAL
      }
    });
    if (isMerchantExistWithCredential) {
      if (!isMerchantExistWithCredential.emailVerified) {
        throw new AppError_default(httpstatus.FORBIDDEN, "User Email Not Varified");
      }
      if (isMerchantExistWithCredential.status === UserStatus.SUSPENDED) {
        throw new AppError_default(httpstatus.FORBIDDEN, "User Is Suspended");
      }
      if (isMerchantExistWithCredential.isDeleted || isMerchantExistWithCredential.status === UserStatus.DELETED) {
        throw new AppError_default(httpstatus.NOT_FOUND, "User Is Deleted");
      }
      user = await prisma.user.update({
        where: {
          id: isMerchantExistWithCredential.id
        },
        data: {
          googleId: googleIdTokenPayload.sub
        }
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: googleIdTokenPayload.name,
        email: googleIdTokenPayload.email,
        role: UserRole.MERCHANT,
        googleId: googleIdTokenPayload.sub,
        authProvider: AuthProvider.GOOGLE,
        emailVerified: true
      }
    });
    const templatePath = path3.join(
      process.cwd(),
      "src/app/template/SwiftDrop-WelcomeEmail.ejs"
    );
    const html = await ejs.renderFile(templatePath, {
      name: googleIdTokenPayload.name
    });
    await nodemailer_default.sendMail({
      from: config_default.sender_email,
      to: googleIdTokenPayload.email,
      subject: "Welcome to SwiftDrop",
      html
    });
  }
  if (!user) {
    throw new AppError_default(httpstatus.NOT_FOUND, "User Not Found");
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3
  };
};
var AuthService = {
  registerMerchant,
  verifyMerchantEmail,
  loginUser,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleLogin
};

// src/app/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};

// src/app/module/auth/auth.controller.ts
import httpstatus2 from "http-status";
var registerMerchant2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    await AuthService.registerMerchant(payload);
    sendResponse(res, {
      statusCode: httpstatus2.CREATED,
      success: true,
      message: "Registration successful. Please verify your email.",
      data: null
    });
  }
);
var verifyMerchantEmail2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const result = await AuthService.verifyMerchantEmail(payload);
    const { accessToken, refreshToken: refreshToken3, user, merchantProfile } = result;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken3, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 7 days
    });
    sendResponse(res, {
      statusCode: httpstatus2.CREATED,
      success: true,
      message: "Email verified successfully",
      data: {
        accessToken,
        refreshToken: refreshToken3,
        user,
        merchantProfile
      }
    });
  }
);
var loginUser2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken: refreshToken3 } = result;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken3, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 7 days
    });
    sendResponse(res, {
      statusCode: httpstatus2.CREATED,
      success: true,
      message: "User Login successfully",
      data: {
        accessToken,
        refreshToken: refreshToken3
      }
    });
  }
);
var getMe2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError_default(
      httpstatus2.BAD_REQUEST,
      "User information is missing in the request"
    );
  }
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    statusCode: httpstatus2.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result
  });
});
var refreshToken2 = catchAsync(async (req, res) => {
  if (!req.cookies.refreshToken) {
    throw new AppError_default(httpstatus2.BAD_REQUEST, "Refresh token is missing");
  }
  const result = await AuthService.refreshToken(req.cookies.refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = result;
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1e3 * 60 * 60 * 24
    // 24 hour or 1 day
  });
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1e3 * 60 * 60 * 24 * 7
    // 7 days
  });
  sendResponse(res, {
    statusCode: httpstatus2.OK,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
});
var forgotPassword2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    await AuthService.forgotPassword(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpstatus2.OK,
      message: `OTP Send To Email : ${payload.email}`,
      data: null
    });
  }
);
var resetPassword2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    await AuthService.resetPassword(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpstatus2.OK,
      message: "Password Change  Successfull",
      data: null
    });
  }
);
var googleLogin2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const result = await AuthService.googleLogin(payload);
    const { accessToken, refreshToken: refreshToken3 } = result;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken3, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 7 days
    });
    sendResponse(res, {
      success: true,
      statusCode: httpstatus2.OK,
      message: "Google Login Successfull",
      data: {
        accessToken,
        refreshToken: refreshToken3
      }
    });
  }
);
var AuthController = {
  registerMerchant: registerMerchant2,
  verifyMerchantEmail: verifyMerchantEmail2,
  loginUser: loginUser2,
  getMe: getMe2,
  refreshToken: refreshToken2,
  forgotPassword: forgotPassword2,
  resetPassword: resetPassword2,
  googleLogin: googleLogin2
};

// src/app/middleware/validationMiddleware.ts
import httpstatus3 from "http-status";
var validationRequest = (zodSchema) => {
  return catchAsync(async (req, res, next) => {
    const payload = req.body ?? {};
    const result = zodSchema.safeParse(payload);
    if (!result.success) {
      throw new AppError_default(httpstatus3.BAD_REQUEST, result.error.issues[0].message);
    }
    req.body = result.data;
    next();
  });
};

// src/app/module/auth/auth.validation.ts
import { z } from "zod";
var merchantRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(50, "Name cannot exceed 100 characters"),
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(50, "Password cannot exceed 100 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  ),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters long").max(150, "Business name cannot exceed 150 characters"),
  businessPhone: z.string().trim().regex(/^01[3-9]\d{8}$/, "Please provide a valid Bangladeshi phone number"),
  businessAddress: z.string().trim().min(5, "Business address must be at least 5 characters long").max(300, "Business address cannot exceed 300 characters")
});
var verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers")
});
var merchantLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(50, "Password cannot exceed 100 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  )
});
var forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address")
});
var resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long").max(100, "Password cannot exceed 100 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  )
});

// src/app/middleware/checkAuth.ts
import httpstatus4 from "http-status";
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization?.split(" ")[1] : req.headers.authorization;
    if (!token) {
      throw new AppError_default(
        httpstatus4.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource."
      );
    }
    const verifiedToken = jwtUtils.verifyToken(token, config_default.jwt_access_secret);
    console.log(verifiedToken, "rider");
    if (!verifiedToken.success) {
      throw new AppError_default(httpstatus4.UNAUTHORIZED, verifiedToken.error);
    }
    const { email, name, userId, role } = verifiedToken.data;
    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError_default(
        httpstatus4.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource."
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        email,
        role
      }
    });
    if (!user) {
      throw new AppError_default(
        httpstatus4.UNAUTHORIZED,
        "User not found. Please log in again."
      );
    }
    if (user.status === "SUSPENDED") {
      throw new AppError_default(
        httpstatus4.FORBIDDEN,
        "Your account has been suspended. Please contact support."
      );
    }
    if (user.isDeleted) {
      throw new AppError_default(
        httpstatus4.FORBIDDEN,
        "Your account has been Deleted. Please contact support."
      );
    }
    req.user = {
      email,
      name,
      userId,
      role
    };
    next();
  });
};

// src/app/module/auth/auth.route.ts
var router = Router();
router.post(
  "/register",
  validationRequest(merchantRegisterSchema),
  AuthController.registerMerchant
);
router.post(
  "/verify-email",
  validationRequest(verifyEmailSchema),
  AuthController.verifyMerchantEmail
);
router.post(
  "/login",
  validationRequest(merchantLoginSchema),
  AuthController.loginUser
);
router.get(
  "/me",
  auth(UserRole.MERCHANT, UserRole.RIDER, UserRole.ADMIN),
  AuthController.getMe
);
router.post(
  "/refresh-token",
  AuthController.refreshToken
);
router.post(
  "/forgot-password",
  validationRequest(forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validationRequest(resetPasswordSchema),
  AuthController.resetPassword
);
router.post(
  "/google",
  AuthController.googleLogin
);
var AuthRoutes = router;

// src/app/middleware/globalErrorHandler.ts
import httpStatus from "http-status";
var globalErrorHandler = async (err, _req, res, _next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  const errorName = err.name || "Internal Server Error";
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST, errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST, errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.BAD_REQUEST, errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please Check Your Credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }
  res.status(statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: config_default.node_env === "development" ? errorName : "Internal Server Error",
    message: config_default.node_env === "development" ? errorMessage : "Internal Server Error",
    error: config_default.node_env === "development" ? err : void 0,
    stack: config_default.node_env === "development" ? err.stack : void 0
  });
};

// src/app/middleware/notFoundRoute.ts
import httpStatus2 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus2.NOT_FOUND).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/app/module/user/user.route.ts
import { Router as Router2 } from "express";

// src/app/module/user/user.controller.ts
import httpstatus6 from "http-status";

// src/app/lib/cloudinary.ts
import { v2 as Cloudinary } from "cloudinary";
Cloudinary.config({
  cloud_name: config_default.cloudinary_cloud_name,
  api_key: config_default.cloudinary_api_key,
  api_secret: config_default.cloudinary_api_secret
});
var cloudinary = Cloudinary;

// src/app/module/user/user.service.ts
import httpstatus5 from "http-status";
var updateUserProfile = async (buffer, userId) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      imagePublicId: true,
      imageUrl: true
    }
  });
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto"
      },
      (error, result2) => {
        if (error) {
          reject(new Error(error.message));
          return;
        }
        if (!result2) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result2);
      }
    );
    uploadStream.end(buffer);
  });
  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    },
    omit: {
      password: true
    }
  });
  if (currentUser?.imagePublicId && currentUser.imagePublicId) {
    await cloudinary.uploader.destroy(currentUser.imagePublicId);
  }
  return updatedUser;
};
var updateMerchantProfile = async (payload, user) => {
  const existingMerchant = await prisma.merchantProfile.findUnique({
    where: { userId: user.userId }
  });
  if (!existingMerchant) {
    throw new AppError_default(httpstatus5.NOT_FOUND, "Merchant Profile Not Found");
  }
  const updatedMerchant = await prisma.merchantProfile.update({
    where: { id: existingMerchant.id },
    data: payload
  });
  return updatedMerchant;
};
var getAllUsers = async (query) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          name: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          email: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  addConditions.push({
    isDeleted: false
  });
  const totalUsers = await prisma.user.count({
    where: {
      AND: addConditions
    }
  });
  const allusers = await prisma.user.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      merchantProfile: true,
      riderProfile: true
    },
    omit: {
      password: true
    }
  });
  return {
    data: allusers,
    meta: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit)
    }
  };
};
var deleteUser = async (userId) => {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  if (!user) {
    throw new AppError_default(httpstatus5.NOT_FOUND, "User Not Found");
  }
  return user;
};
var getSingleUser = async (userId) => {
  const getSingleUser3 = await prisma.user.findUnique({
    where: {
      id: userId
    },
    include: {
      merchantProfile: true,
      riderProfile: true
    }
  });
  if (!getSingleUser3) {
    throw new AppError_default(httpstatus5.NOT_FOUND, "Single User Not Found");
  }
  return getSingleUser3;
};
var userService = {
  updateUserProfile,
  updateMerchantProfile,
  getAllUsers,
  deleteUser,
  getSingleUser
};

// src/app/module/user/user.controller.ts
var updateUserProfile2 = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError_default(httpstatus6.NOT_FOUND, "File Not Found");
  }
  const userId = req.user?.userId;
  const result = await userService.updateUserProfile(req.file?.buffer, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpstatus6.OK,
    message: "User Profile Update Successfully",
    data: result
  });
});
var updateMerchantProfile2 = catchAsync(
  async (req, res) => {
    const result = await userService.updateMerchantProfile(
      req.body,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus6.OK,
      message: "Merchant Profile Update Successfully",
      data: result
    });
  }
);
var getAllUsers2 = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpstatus6.OK,
    message: "Retrieve All Users Successfully",
    data: result
  });
});
var getSingleUser2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await userService.getSingleUser(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpstatus6.OK,
    message: "Retrieve Single User Successfully",
    data: result
  });
});
var deleteUser2 = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await userService.deleteUser(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpstatus6.OK,
    message: "Deleted  User Successfully",
    data: result
  });
});
var userController = {
  updateUserProfile: updateUserProfile2,
  updateMerchantProfile: updateMerchantProfile2,
  getAllUsers: getAllUsers2,
  getSingleUser: getSingleUser2,
  deleteUser: deleteUser2
};

// src/app/lib/multer.ts
import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({ storage });

// src/app/module/user/user.validation.ts
import z2 from "zod";
var updateMerchantProfileSchema = z2.object({
  businessName: z2.string().trim().min(2, "Business name must be at least 2 characters long").max(150, "Business name cannot exceed 150 characters").optional(),
  businessPhone: z2.string().trim().regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladeshi phone number"
  ).optional(),
  businessAddress: z2.string().trim().min(5, "Business address must be at least 5 characters long").max(300, "Business address cannot exceed 300 characters").optional()
});

// src/app/module/user/user.route.ts
var router2 = Router2();
router2.patch(
  "/profile-image",
  auth(UserRole.ADMIN, UserRole.MERCHANT, UserRole.RIDER),
  upload.single("profileImage"),
  userController.updateUserProfile
);
router2.patch(
  "/merchant-profile",
  auth(UserRole.MERCHANT),
  validationRequest(updateMerchantProfileSchema),
  userController.updateMerchantProfile
);
router2.get(
  "/get-all-users",
  auth(UserRole.ADMIN),
  userController.getAllUsers
);
router2.get(
  "/get-single-user/:userId",
  auth(UserRole.ADMIN),
  userController.getSingleUser
);
router2.patch(
  "/delete-user/:userId",
  auth(UserRole.ADMIN),
  userController.deleteUser
);
var UserRoutes = router2;

// src/app/module/rider/rider.route.ts
import { Router as Router3 } from "express";

// src/app/module/rider/rider.validation.ts
import { z as z3 } from "zod";
var applyAsRiderSchema = z3.object({
  name: z3.string().trim().min(2, "Name must be at least 2 characters long").max(100, "Name cannot exceed 100 characters"),
  email: z3.string().trim().toLowerCase().email("Please provide a valid email address"),
  phone: z3.string().trim().regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladeshi phone number"
  ),
  address: z3.string().trim().min(5, "Address must be at least 5 characters long").max(300, "Address cannot exceed 300 characters"),
  vehicleType: z3.enum(
    ["BIKE", "MOTORCYCLE"],
    "Please select a valid vehicle type"
  ),
  licenseNumber: z3.string().trim().min(5, "License number must be at least 5 characters long").max(50, "License number cannot exceed 50 characters")
});
var verifyEmailSchema2 = z3.object({
  email: z3.string().trim().toLowerCase().email("Please provide a valid email address"),
  otp: z3.string().trim().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers")
});
var reviewRiderSchema = z3.object({
  status: z3.enum(["ACTIVE", "REJECTED"], {
    message: "Status must be either ACTIVE or REJECTED"
  }),
  riderId: z3.string().uuid("Invalid rider ID"),
  rejectionReason: z3.string().trim().max(500, "Rejection reason cannot exceed 500 characters").optional()
}).superRefine((data, ctx) => {
  if (data.status === "REJECTED" && !data.rejectionReason) {
    ctx.addIssue({
      code: "custom",
      path: ["rejectionReason"],
      message: "Rejection reason is required when rejecting a rider"
    });
  }
});
var updateRiderProfileSchema = z3.object({
  phone: z3.string().trim().regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladeshi phone number"
  ).optional(),
  address: z3.string().trim().min(5, "Address must be at least 5 characters long").max(300, "Address cannot exceed 300 characters").optional(),
  vehicleType: z3.enum(["BIKE", "MOTORCYCLE"], {
    message: "Please select a valid vehicle type"
  }).optional(),
  licenseNumber: z3.string().trim().min(5, "License number must be at least 5 characters long").max(50, "License number cannot exceed 50 characters").optional()
});
var riderShipmentQuerySchema = z3.object({
  page: z3.coerce.number().int().positive().default(1),
  limit: z3.coerce.number().int().positive().max(100).default(10),
  status: z3.enum([
    "ASSIGNED",
    "ACCEPTED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RETURNED"
  ]).optional()
});

// src/app/module/rider/rider.service.ts
import bcrypt2 from "bcryptjs";
import crypto2 from "crypto";
import httpstatus7 from "http-status";
import path4 from "path";
import ejs2 from "ejs";
var applyAsRider = async (payload) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });
  if (isUserExist) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      "Rider Already Exist With This Email"
    );
  }
  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt2.hash(
    randomPassword,
    Number(config_default.bcrypt_salt_rounds)
  );
  const createRider = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: UserRole.RIDER,
      needPasswordChange: true,
      riderProfile: {
        create: {
          address: payload.address,
          phone: payload.phone,
          licenseNumber: payload.licenseNumber,
          vehicleType: payload.vehicleType
        }
      }
    }
  });
  const expiresInSeconds = 60 * 60;
  const otpKey = `rider-emailVerify-otp:${payload.email}`;
  const otpValue = crypto2.randomInt(1e5, 1e6).toString();
  await redis_default.set(otpKey, otpValue, {
    expiration: {
      type: "EX",
      value: expiresInSeconds
    }
  });
  const templatePath = path4.join(
    process.cwd(),
    "src/app/template/SwiftDrop-RiderVerificationEmail.ejs"
  );
  const html = await ejs2.renderFile(templatePath, {
    name: payload.name,
    otpValue,
    expiresIn: 60
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: payload.email,
    subject: "Verify Your SwiftDrop Rider Account",
    html
  });
  return createRider;
};
var verifyRiderEmail = async (payload) => {
  const otp = payload.otp;
  const email = payload.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
      role: UserRole.RIDER
    }
  });
  if (!existingUser) {
    throw new AppError_default(
      httpstatus7.NOT_FOUND,
      "Rider Application Not Found. Please Apply Again"
    );
  }
  if (existingUser.emailVerified) {
    throw new AppError_default(httpstatus7.CONFLICT, "Email Already Varified");
  }
  const otpKey = `rider-emailVerify-otp:${email}`;
  const redisOtp = await redis_default.get(otpKey);
  if (!redisOtp) {
    throw new AppError_default(
      httpstatus7.BAD_REQUEST,
      "OTP Expired. Your Application Window Has Closed. Please Apply Again"
    );
  }
  if (redisOtp !== otp) {
    throw new AppError_default(httpstatus7.BAD_REQUEST, "Otp Does Not Match");
  }
  await redis_default.del(otpKey);
  const verifyUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: true
    },
    omit: { password: true },
    include: { riderProfile: true }
  });
  return verifyUser;
};
var approveRider = async (payload, reviewer) => {
  const { riderId, status, rejectionReason } = payload;
  const existingRider = await prisma.riderProfile.findUnique({
    where: { id: riderId },
    include: { user: true }
  });
  if (!existingRider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Application Not Found.");
  }
  if (!existingRider.user.emailVerified) {
    throw new AppError_default(
      httpstatus7.FORBIDDEN,
      "Rider Has Not Verified Their Email Yet.Application Can Not Be reviewed "
    );
  }
  if (existingRider.status !== RiderStatus.PENDING) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Rider Application Has Already Been ${existingRider.status.toLowerCase()}`
    );
  }
  const updateRider = await prisma.riderProfile.update({
    where: {
      id: riderId
    },
    include: { user: true },
    data: {
      status,
      rejectionReason: status === RiderStatus.REJECTED ? rejectionReason : null,
      rejectedAt: status === RiderStatus.REJECTED ? /* @__PURE__ */ new Date() : null,
      reviewedBy: reviewer.userId,
      reviewedAt: /* @__PURE__ */ new Date()
    }
  });
  const isApproved = status === RiderStatus.ACTIVE;
  const templateName = isApproved ? "SwiftDrop-RiderApplicationApproved.ejs" : "SwiftDrop-RiderApplicationRejected.ejs";
  const templatePath = path4.join(
    process.cwd(),
    `src/app/template/${templateName}`
  );
  const html = await ejs2.renderFile(templatePath, {
    name: updateRider.user.name,
    rejectionReason
  });
  await nodemailer_default.sendMail({
    from: config_default.sender_email,
    to: updateRider.user.email,
    subject: isApproved ? "Your SwiftDrop Rider Application Has Been Approved" : "Update on Your SwiftDrop Rider Application",
    html
  });
  return updateRider;
};
var getAllRiders = async (query) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          phone: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          address: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          licenseNumber: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (query.vehicleType) {
    addConditions.push({
      vehicleType: query.vehicleType
    });
  }
  if (query.address) {
    addConditions.push({
      address: {
        contains: query.address,
        mode: "insensitive"
      }
    });
  }
  if (query.licenseNumber) {
    addConditions.push({
      licenseNumber: {
        equals: query.licenseNumber,
        mode: "insensitive"
      }
    });
  }
  if (query.status) {
    addConditions.push({
      status: query.status
    });
  }
  addConditions.push({
    isSuspended: false
  });
  const totalRider = await prisma.riderProfile.count({
    where: {
      AND: addConditions
    }
  });
  const allRiders = await prisma.riderProfile.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        omit: {
          password: true
        }
      }
    }
  });
  return {
    data: allRiders,
    meta: {
      page,
      limit,
      total: totalRider,
      totalPages: Math.ceil(totalRider / limit)
    }
  };
};
var getSingleRider = async (riderId) => {
  const singleRider = await prisma.riderProfile.findUnique({
    where: {
      id: riderId
    },
    include: {
      user: {
        omit: {
          password: true
        }
      }
    }
  });
  if (!singleRider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Single Rider Not Found");
  }
  return singleRider;
};
var updateRiderProfile = async (payload, user) => {
  const existingRider = await prisma.riderProfile.findUnique({
    where: { userId: user.userId }
  });
  if (!existingRider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  const updatedRider = await prisma.riderProfile.update({
    where: { id: existingRider.id },
    data: payload
  });
  return updatedRider;
};
var getMyAssignedShipments = async (query, user) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    },
    include: {
      user: true
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  if (rider.user.isDeleted) {
    throw new AppError_default(httpstatus7.FORBIDDEN, "This account has been deleted.");
  }
  if (rider.user.status === UserStatus.SUSPENDED) {
    throw new AppError_default(
      httpstatus7.FORBIDDEN,
      "This rider account is suspended."
    );
  }
  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError_default(
      httpstatus7.FORBIDDEN,
      "Only active riders can access assigned shipments."
    );
  }
  const conditions = [
    {
      riderId: rider.id
    }
  ];
  if (query.status) {
    conditions.push({
      status: query.status
    });
  }
  const totalShipment = await prisma.shipment.count({
    where: {
      AND: conditions
    }
  });
  const shipments = await prisma.shipment.findMany({
    where: {
      AND: conditions
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      trackingId: true,
      senderName: true,
      senderPhone: true,
      senderAddress: true,
      recipientName: true,
      recipientPhone: true,
      recipientAddress: true,
      parcelType: true,
      parcelDescription: true,
      weight: true,
      codAmount: true,
      deliveryFee: true,
      status: true,
      assignedAt: true,
      pickedUpAt: true,
      deliveredAt: true,
      deliveryFailedAt: true,
      failureReason: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return {
    data: shipments,
    meta: {
      page,
      limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit)
    }
  };
};
var acceptShipment = async (shipmentId, user) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError_default(
      httpstatus7.FORBIDDEN,
      "Only active riders can accept shipments."
    );
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Assigned Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.ASSIGNED) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Shipment cannot be accepted while it is ${shipment.status}.`
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.ACCEPTED
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.ACCEPTED,
        description: "Rider accepted the shipment.",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_ACCEPTED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id
        }
      }
    });
    return updatedShipment;
  });
  return result;
};
var pickupShipment = async (shipmentId, user) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Assigned Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.ACCEPTED) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Shipment cannot be picked up while it is ${shipment.status}.`
    );
  }
  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.PICKED_UP,
        pickedUpAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.PICKED_UP,
        description: "Shipment picked up by rider.",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_PICKED_UP",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id
        }
      }
    });
    return updatedShipment;
  });
};
var markInTransit = async (shipmentId, user) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Assigned Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.PICKED_UP) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Shipment cannot move to transit while it is ${shipment.status}.`
    );
  }
  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.IN_TRANSIT
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.IN_TRANSIT,
        description: "Shipment is now in transit.",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_IN_TRANSIT",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id
        }
      }
    });
    return updatedShipment;
  });
};
var outForDelivery = async (shipmentId, user) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Assigned Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Shipment cannot be marked out for delivery while it is ${shipment.status}.`
    );
  }
  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.OUT_FOR_DELIVERY
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        description: "Shipment is out for delivery.",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_OUT_FOR_DELIVERY",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id
        }
      }
    });
    return updatedShipment;
  });
};
var deliverShipment = async (shipmentId, user) => {
  const rider = await prisma.riderProfile.findUnique({
    where: {
      userId: user.userId
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Rider Profile Not Found");
  }
  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      riderId: rider.id
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus7.NOT_FOUND, "Assigned Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY) {
    throw new AppError_default(
      httpstatus7.CONFLICT,
      `Shipment cannot be marked out for delivery while it is ${shipment.status}.`
    );
  }
  return await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.DELIVERED,
        deliveredAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.DELIVERED,
        description: "Shipment delivered successfully.",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_DELIVERED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          riderId: rider.id
        }
      }
    });
    return updatedShipment;
  });
};
var riderService = {
  applyAsRider,
  verifyRiderEmail,
  approveRider,
  getAllRiders,
  getSingleRider,
  updateRiderProfile,
  getMyAssignedShipments,
  acceptShipment,
  pickupShipment,
  markInTransit,
  outForDelivery,
  deliverShipment
};

// src/app/module/rider/rider.controller.ts
import httpStatus3 from "http-status";
var applyAsRider2 = catchAsync(
  async (req, res, next) => {
    const result = await riderService.applyAsRider(req.body);
    sendResponse(res, {
      statusCode: httpStatus3.CREATED,
      success: true,
      message: "Rider application submitted successfully. Please verify your email and wait for admin approval.",
      data: result
    });
  }
);
var verifyRiderEmail2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const result = await riderService.verifyRiderEmail(payload);
    sendResponse(res, {
      statusCode: httpStatus3.CREATED,
      success: true,
      message: "Rider email verified successfully",
      data: result
    });
  }
);
var approveRider2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const user = req.user;
    const result = await riderService.approveRider(
      payload,
      user
    );
    const message = result.status === "ACTIVE" ? "Rider application approved successfully" : "Rider application rejected successfully";
    sendResponse(res, {
      statusCode: httpStatus3.OK,
      success: true,
      message,
      data: result
    });
  }
);
var getAllRiders2 = catchAsync(
  async (req, res, next) => {
    const result = await riderService.getAllRiders(req.query);
    sendResponse(res, {
      statusCode: httpStatus3.OK,
      success: true,
      message: "Retrieve All Riders successfully",
      data: result
    });
  }
);
var getSingleRider2 = catchAsync(
  async (req, res, next) => {
    const riderId = req.params.riderId;
    const result = await riderService.getSingleRider(riderId);
    sendResponse(res, {
      statusCode: httpStatus3.OK,
      success: true,
      message: "Get Single Rider successfully",
      data: result
    });
  }
);
var updateRiderProfile2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const user = req.user;
    const result = await riderService.updateRiderProfile(
      payload,
      user
    );
    sendResponse(res, {
      statusCode: httpStatus3.OK,
      success: true,
      message: "Update Rider Profile successfully",
      data: result
    });
  }
);
var getMyAssignedShipments2 = catchAsync(
  async (req, res) => {
    const result = await riderService.getMyAssignedShipments(
      req.query,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Assigned Shipments Retrieved Successfully",
      data: result
    });
  }
);
var acceptShipment2 = catchAsync(
  async (req, res) => {
    const result = await riderService.acceptShipment(
      req.params.shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Shipment Accepted Successfully",
      data: result
    });
  }
);
var pickupShipment2 = catchAsync(
  async (req, res) => {
    const result = await riderService.pickupShipment(
      req.params.shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Shipment Picked Up Successfully",
      data: result
    });
  }
);
var markInTransit2 = catchAsync(
  async (req, res) => {
    const result = await riderService.markInTransit(
      req.params.shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Shipment Transit Up Successfully",
      data: result
    });
  }
);
var outForDelivery2 = catchAsync(
  async (req, res) => {
    const result = await riderService.outForDelivery(
      req.params.shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Shipment Out For Delivery Successfully",
      data: result
    });
  }
);
var deliverShipment2 = catchAsync(
  async (req, res) => {
    const result = await riderService.deliverShipment(
      req.params.shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus3.OK,
      message: "Shipment  Delivery Successfully",
      data: result
    });
  }
);
var riderController = {
  applyAsRider: applyAsRider2,
  verifyRiderEmail: verifyRiderEmail2,
  approveRider: approveRider2,
  getAllRiders: getAllRiders2,
  getSingleRider: getSingleRider2,
  updateRiderProfile: updateRiderProfile2,
  getMyAssignedShipments: getMyAssignedShipments2,
  acceptShipment: acceptShipment2,
  pickupShipment: pickupShipment2,
  markInTransit: markInTransit2,
  outForDelivery: outForDelivery2,
  deliverShipment: deliverShipment2
};

// src/app/module/rider/rider.route.ts
var router3 = Router3();
router3.post(
  "/apply-as-rider",
  validationRequest(applyAsRiderSchema),
  riderController.applyAsRider
);
router3.post(
  "/verify-rider-email",
  validationRequest(verifyEmailSchema2),
  riderController.verifyRiderEmail
);
router3.post(
  "/approve-rider",
  auth(UserRole.ADMIN),
  validationRequest(reviewRiderSchema),
  riderController.approveRider
);
router3.get(
  "/get-all-riders",
  auth(UserRole.ADMIN),
  riderController.getAllRiders
);
router3.patch(
  "/update-rider-profile",
  auth(UserRole.RIDER),
  validationRequest(updateRiderProfileSchema),
  riderController.updateRiderProfile
);
router3.get(
  "/my-shipments",
  auth(UserRole.RIDER),
  riderController.getMyAssignedShipments
);
router3.patch(
  "/shipments/:shipmentId/accept",
  auth(UserRole.RIDER),
  riderController.acceptShipment
);
router3.patch(
  "/shipments/:shipmentId/pickup",
  auth(UserRole.RIDER),
  riderController.pickupShipment
);
router3.patch(
  "/shipments/:shipmentId/markInTransit",
  auth(UserRole.RIDER),
  riderController.markInTransit
);
router3.patch(
  "/shipments/:shipmentId/outForDelivery",
  auth(UserRole.RIDER),
  riderController.outForDelivery
);
router3.patch(
  "/shipments/:shipmentId/deliverShipment",
  auth(UserRole.RIDER),
  riderController.deliverShipment
);
router3.get(
  "/:riderId",
  auth(UserRole.ADMIN),
  riderController.getSingleRider
);
var RiderRoutes = router3;

// src/app/module/shipment/shipment.route.ts
import { Router as Router4 } from "express";

// src/app/module/shipment/shipment.controller.ts
import httpstatus9 from "http-status";

// src/app/module/shipment/shipment.service.ts
import httpstatus8 from "http-status";

// src/app/module/shipment/shipment.utils.ts
var calculateDeliveryFee = (weight) => {
  const baseFee = 80;
  if (!weight || weight <= 1) {
    return baseFee;
  }
  const additionalWeight = Math.ceil(weight - 1);
  return baseFee + additionalWeight * 30;
};

// src/app/module/shipment/shipment.service.ts
var generateTrackingId = () => {
  const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SWD-${date}-${randomPart}`;
};
var createShipment = async (payload, user) => {
  const merchant = await prisma.merchantProfile.findUnique({
    where: {
      userId: user.userId
    },
    include: {
      user: true
    }
  });
  if (!merchant) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Merchant Profile Not Found");
  }
  if (merchant.user.isDeleted) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "This User Is Deleted");
  }
  const trackingId = generateTrackingId();
  const deliveryFee = calculateDeliveryFee(payload.weight);
  const result = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
      data: {
        trackingId,
        merchantId: merchant.id,
        senderName: payload.senderName,
        senderPhone: payload.senderPhone,
        senderAddress: payload.senderAddress,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        recipientAddress: payload.recipientAddress,
        parcelType: payload.parcelType,
        parcelDescription: payload.parcelDescription,
        weight: payload.weight,
        deliveryFee,
        codAmount: payload.codAmount,
        status: ShipmentStatus.PAYMENT_PENDING
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.PAYMENT_PENDING,
        description: "Shipment created and waiting for payment",
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_CREATED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          trackingId: shipment.trackingId,
          status: ShipmentStatus.PAYMENT_PENDING
        }
      }
    });
    return shipment;
  });
  return result;
};
var getAllShipmentAdmin = async (query, user) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!existingUser) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "User Not Found");
  }
  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError_default(
      httpstatus8.FORBIDDEN,
      "You are not authorized to access shipment records."
    );
  }
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          trackingId: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          senderName: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          senderPhone: {
            contains: query.searchTerm
          }
        },
        {
          recipientName: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          recipientPhone: {
            contains: query.searchTerm
          }
        },
        {
          recipientAddress: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (query.status) {
    addConditions.push({
      status: query.status
    });
  }
  const totalShipment = await prisma.shipment.count({
    where: {
      AND: addConditions
    }
  });
  const allShipment = await prisma.shipment.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      payments: true,
      trackingEvents: {
        orderBy: {
          createdAt: "desc"
        }
      },
      merchant: {
        select: {
          id: true,
          businessName: true,
          businessPhone: true
        }
      },
      rider: {
        select: {
          id: true,
          phone: true,
          vehicleType: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
  return {
    data: allShipment,
    meta: {
      page,
      limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit)
    }
  };
};
var getSingleShipmentAdmin = async (shipmentId, user) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!existingUser) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "User Not Found");
  }
  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError_default(
      httpstatus8.FORBIDDEN,
      "You are not authorized to access shipment records."
    );
  }
  const singleShipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId
    },
    include: {
      trackingEvents: {
        orderBy: {
          createdAt: "asc"
        }
      },
      payments: {
        orderBy: {
          createdAt: "desc"
        }
      },
      merchant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      rider: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
  if (!singleShipment) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Shipment Not Found");
  }
  return singleShipment;
};
var assignRider = async (shipmentId, payload, user) => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!existingAdmin) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Admin Not Found");
  }
  if (existingAdmin.role !== UserRole.ADMIN) {
    throw new AppError_default(
      httpstatus8.FORBIDDEN,
      "You are not authorized to assign riders."
    );
  }
  const shipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId
    }
  });
  if (!shipment) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Shipment Not Found");
  }
  if (shipment.status !== ShipmentStatus.PAYMENT_CONFIRMED) {
    throw new AppError_default(
      httpstatus8.CONFLICT,
      `Rider cannot be assigned while shipment is ${shipment.status}.`
    );
  }
  if (shipment.riderId) {
    throw new AppError_default(
      httpstatus8.CONFLICT,
      "A rider is already assigned to this shipment."
    );
  }
  const rider = await prisma.riderProfile.findUnique({
    where: {
      id: payload.riderId
    },
    include: {
      user: true
    }
  });
  if (!rider) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Rider Not Found");
  }
  if (rider.status !== RiderStatus.ACTIVE) {
    throw new AppError_default(
      httpstatus8.CONFLICT,
      "Only active riders can be assigned to shipments."
    );
  }
  if (rider.user.isDeleted) {
    throw new AppError_default(
      httpstatus8.FORBIDDEN,
      "This rider account has been deleted."
    );
  }
  if (rider.user.status === UserStatus.SUSPENDED) {
    throw new AppError_default(
      httpstatus8.FORBIDDEN,
      "This rider account is suspended."
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: {
        id: shipmentId
      },
      data: {
        riderId: rider.id,
        assignedAt: /* @__PURE__ */ new Date(),
        status: ShipmentStatus.ASSIGNED
      },
      include: {
        rider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.ASSIGNED,
        description: `Shipment assigned to rider ${rider.user.name}.`,
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "RIDER_ASSIGNED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          riderId: rider.id,
          riderName: rider.user.name,
          trackingId: shipment.trackingId
        }
      }
    });
    return updatedShipment;
  });
  return result;
};
var getAllShipment = async (query, user) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true
    }
  });
  if (!isUserExist) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "user  Not Found");
  }
  if (query.searchTerm) {
    addConditions.push({
      OR: [
        {
          recipientName: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          recipientAddress: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        },
        {
          recipientPhone: {
            contains: query.searchTerm,
            mode: "insensitive"
          }
        }
      ]
    });
  }
  if (query.status) {
    addConditions.push({
      status: query.vehicleType
    });
  }
  addConditions.push({
    merchantId: isUserExist.merchantProfile?.id
  });
  const totalShipment = await prisma.shipment.count({
    where: {
      AND: addConditions
    }
  });
  const allShipment = await prisma.shipment.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      trackingEvents: true
    }
  });
  return {
    data: allShipment,
    meta: {
      page,
      limit,
      total: totalShipment,
      totalPages: Math.ceil(totalShipment / limit)
    }
  };
};
var getSingleShipment = async (shipmentId, user) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true
    }
  });
  if (!isUserExist) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "user  Not Found");
  }
  const singleShipment = await prisma.shipment.findUnique({
    where: {
      id: shipmentId,
      merchantId: isUserExist.merchantProfile?.id
    },
    include: {
      trackingEvents: true
    }
  });
  if (!singleShipment) {
    throw new AppError_default(httpstatus8.NOT_FOUND, "Shipment Not Found");
  }
  return singleShipment;
};
var shipmentService = {
  createShipment,
  getAllShipment,
  getSingleShipment,
  getAllShipmentAdmin,
  getSingleShipmentAdmin,
  assignRider
};

// src/app/module/shipment/shipment.controller.ts
var createShipment2 = catchAsync(
  async (req, res) => {
    const result = await shipmentService.createShipment(
      req.body,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.CREATED,
      message: "Shipment Created Successfully",
      data: result
    });
  }
);
var getAllShipmentAdmin2 = catchAsync(
  async (req, res) => {
    const result = await shipmentService.getAllShipmentAdmin(
      req.query,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.CREATED,
      message: "Retrieve All Shipment Successfully",
      data: result
    });
  }
);
var getSingleShipmentAdmin2 = catchAsync(
  async (req, res) => {
    const shipmentId = req.params.shipmentId;
    const result = await shipmentService.getSingleShipmentAdmin(
      shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.CREATED,
      message: "Retrieve Single Shipment Successfully",
      data: result
    });
  }
);
var assignRider2 = catchAsync(
  async (req, res) => {
    const result = await shipmentService.assignRider(
      req.params.shipmentId,
      req.body,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.OK,
      message: "Rider Assigned Successfully",
      data: result
    });
  }
);
var getAllShipment2 = catchAsync(
  async (req, res) => {
    const result = await shipmentService.getAllShipment(
      req.query,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.CREATED,
      message: "Retrieve All Shipment Successfully",
      data: result
    });
  }
);
var getSingleShipment2 = catchAsync(
  async (req, res) => {
    const shipmentId = req.params.shipmentId;
    const result = await shipmentService.getSingleShipment(
      shipmentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpstatus9.CREATED,
      message: "Retrieve Single Shipment Successfully",
      data: result
    });
  }
);
var shipmentController = {
  createShipment: createShipment2,
  getAllShipment: getAllShipment2,
  getSingleShipment: getSingleShipment2,
  getAllShipmentAdmin: getAllShipmentAdmin2,
  getSingleShipmentAdmin: getSingleShipmentAdmin2,
  assignRider: assignRider2
};

// src/app/module/shipment/shipment.validation.ts
import { z as z4 } from "zod";
var createShipmentSchema = z4.object({
  senderName: z4.string().trim().min(2, "Sender name must be at least 2 characters long").max(100, "Sender name cannot exceed 100 characters"),
  senderPhone: z4.string().trim().regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladeshi sender phone number"
  ),
  senderAddress: z4.string().trim().min(5, "Sender address must be at least 5 characters long").max(300, "Sender address cannot exceed 300 characters"),
  recipientName: z4.string().trim().min(2, "Recipient name must be at least 2 characters long").max(100, "Recipient name cannot exceed 100 characters"),
  recipientPhone: z4.string().trim().regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladeshi recipient phone number"
  ),
  recipientAddress: z4.string().trim().min(5, "Recipient address must be at least 5 characters long").max(300, "Recipient address cannot exceed 300 characters"),
  parcelType: z4.string().trim().min(2, "Parcel type must be at least 2 characters long").max(50, "Parcel type cannot exceed 50 characters"),
  parcelDescription: z4.string().trim().max(500, "Parcel description cannot exceed 500 characters").optional(),
  weight: z4.number().positive("Weight must be greater than 0").max(100, "Weight cannot exceed 100 kg").optional(),
  codAmount: z4.number().min(0, "COD amount cannot be negative").default(0)
});
var assignRiderSchema = z4.object({
  riderId: z4.string().uuid("Invalid rider ID")
});

// src/app/module/shipment/shipment.route.ts
var router4 = Router4();
router4.post(
  "/",
  validationRequest(createShipmentSchema),
  auth(UserRole.MERCHANT),
  shipmentController.createShipment
);
router4.get(
  "/get-all-shipment-admin",
  auth(UserRole.ADMIN),
  shipmentController.getAllShipmentAdmin
);
router4.get(
  "/get-single-shipment-admin/:shipmentId",
  auth(UserRole.ADMIN),
  shipmentController.getSingleShipmentAdmin
);
router4.patch(
  "/:shipmentId/assign-rider",
  validationRequest(assignRiderSchema),
  auth(UserRole.ADMIN),
  shipmentController.assignRider
);
router4.get(
  "/get-all-shipment-merchant",
  auth(UserRole.MERCHANT),
  shipmentController.getAllShipment
);
router4.get(
  "/get-single-shipment-merchant/:shipmentId",
  auth(UserRole.MERCHANT),
  shipmentController.getSingleShipment
);
var ShipmentRouter = router4;

// src/app/module/payment/payment.route.ts
import { Router as Router5 } from "express";

// src/app/module/payment/payment.controller.ts
import httpStatus4 from "http-status";

// src/app/lib/bkash.ts
import httpstatus10 from "http-status";
var getBkashIdToken = async () => {
  try {
    const idTokenKey = "bkash:idToken";
    const refreshTokeKey = "bkash:refreshToken";
    let bkashIdToken = await redis_default.get(idTokenKey);
    const bkashRefreshToken = await redis_default.get(refreshTokeKey);
    const bkashIdTokenExpiration = await redis_default.ttl(idTokenKey);
    const bkashRefreshTokenExpiration = await redis_default.ttl(refreshTokeKey);
    if ((bkashIdTokenExpiration <= 600 || !bkashIdToken) && bkashRefreshToken && bkashRefreshTokenExpiration > 600) {
      const refreshTokenResponse = await fetch(
        `${config_default.bkash_base_url}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config_default.bkash_username,
            password: config_default.bkash_password
          },
          body: JSON.stringify({
            app_key: config_default.bkash_app_key,
            app_secret: config_default.bkash_app_secret,
            refresh_token: bkashRefreshToken
          })
        }
      );
      if (!refreshTokenResponse.ok) {
        throw new AppError_default(httpstatus10.INTERNAL_SERVER_ERROR, "Bkash Refresh Token Grant Failed");
      }
      const refreshTokenResult = await refreshTokenResponse.json();
      bkashIdToken = refreshTokenResult.id_token;
      await redis_default.set(idTokenKey, bkashIdToken, {
        expiration: {
          type: "EX",
          value: Number(refreshTokenResult.expires_in)
        }
      });
      return bkashIdToken;
    }
    if (bkashIdToken && bkashIdTokenExpiration > 600) {
      return bkashIdToken;
    }
    const response = await fetch(
      `${config_default.bkash_base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config_default.bkash_username,
          password: config_default.bkash_password
        },
        body: JSON.stringify({
          app_key: config_default.bkash_app_key,
          app_secret: config_default.bkash_app_secret
        })
      }
    );
    if (!response.ok) {
      throw new AppError_default(httpstatus10.INTERNAL_SERVER_ERROR, "Bkash Access Token Grant Failed");
    }
    const result = await response.json();
    await redis_default.set(idTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: Number(result.expires_in)
      }
    });
    await redis_default.set(refreshTokeKey, result.refresh_token, {
      expiration: {
        type: "EX",
        value: Number(result.refresh_expires_in)
      }
    });
    bkashIdToken = result.id_token;
    return bkashIdToken;
  } catch (error) {
    throw new AppError_default(httpstatus10.INTERNAL_SERVER_ERROR, `Bkash Access Token Grant Failed: ${error}`);
  }
};

// src/app/module/payment/payment.service.ts
import httpstatus11 from "http-status";
import path5 from "path";
import ejs3 from "ejs";
var initiateShipmentPayment = async (payload, user) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true
    }
  });
  if (!isUserExist) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "User Not Found");
  }
  if (isUserExist.isDeleted) {
    throw new AppError_default(httpstatus11.FORBIDDEN, "This account has been deleted");
  }
  if (isUserExist.status === "SUSPENDED") {
    throw new AppError_default(
      httpstatus11.FORBIDDEN,
      "This account is suspended. Please contact support."
    );
  }
  if (!isUserExist.merchantProfile) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "Merchant Profile Not Found");
  }
  const isShipmentExist = await prisma.shipment.findUnique({
    where: {
      id: payload.shipmentId,
      merchantId: isUserExist.merchantProfile.id
    },
    include: {
      payments: true
    }
  });
  if (!isShipmentExist) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "Shipment Not Found");
  }
  if (isShipmentExist.status !== ShipmentStatus.PAYMENT_PENDING) {
    throw new AppError_default(
      httpstatus11.CONFLICT,
      `This Shipment Already Has Been ${isShipmentExist.status}`
    );
  }
  const PAYMENT_EXPIRY_MINUTES = 10;
  const pendingPayment = isShipmentExist.payments.find(
    (payment) => payment.status === PaymentStatus.PENDING
  );
  if (pendingPayment) {
    const expiryTime = new Date(
      pendingPayment.createdAt.getTime() + PAYMENT_EXPIRY_MINUTES * 60 * 1e3
    );
    if (/* @__PURE__ */ new Date() >= expiryTime) {
      await prisma.payment.update({
        where: {
          id: pendingPayment.id
        },
        data: {
          status: PaymentStatus.EXPIRED
        }
      });
    } else {
      throw new AppError_default(
        httpstatus11.CONFLICT,
        "A payment is already pending for this shipment. Try 10 minute later"
      );
    }
  }
  const amount = Number(isShipmentExist.deliveryFee);
  const bkashIdToken = await getBkashIdToken();
  if (!bkashIdToken) {
    throw new AppError_default(httpstatus11.BAD_REQUEST, "Bkash Access Token Not Found.");
  }
  const createBkashPaymentResponse = await fetch(
    `${config_default.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config_default.bkash_app_key
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: user.email,
        // email or phone number
        callbackURL: `${config_default.bkash_callback_url}/payment/bkash/payment/callback`,
        amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: isShipmentExist.id
      })
    }
  );
  if (!createBkashPaymentResponse.ok) {
    throw new AppError_default(
      httpstatus11.BAD_GATEWAY,
      "Failed to create bKash payment"
    );
  }
  const createBkashPaymentResult = await createBkashPaymentResponse.json();
  const merchantInvoiceNumber = `SWD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  await prisma.payment.create({
    data: {
      shipmentId: isShipmentExist.id,
      amount,
      status: PaymentStatus.PENDING,
      merchantInvoiceNumber,
      bkashPaymentId: createBkashPaymentResult.paymentID,
      payerReference: user.email,
      gatewayResponse: createBkashPaymentResult
    }
  });
  return {
    paymentURL: createBkashPaymentResult.bkashURL
  };
};
var initiateShipmentPaymentCallback = async (query) => {
  const transactionResult = await prisma.$transaction(
    async (tx) => {
      const paymentId = query.paymentID;
      if (!paymentId) {
        throw new AppError_default(httpstatus11.NOT_FOUND, "payment is Not Found");
      }
      const status = query.status;
      if (!status) {
        throw new AppError_default(httpstatus11.BAD_REQUEST, "Status Is Missing");
      }
      const bkashIdToken = await getBkashIdToken();
      if (!bkashIdToken) {
        throw new AppError_default(
          httpstatus11.BAD_REQUEST,
          "Bkash Access Token Not Found."
        );
      }
      const executePaymentResponse = await fetch(
        `${config_default.bkash_base_url}/tokenized/checkout/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: bkashIdToken,
            "X-App-Key": config_default.bkash_app_key
          },
          body: JSON.stringify({
            paymentID: paymentId
          })
        }
      );
      if (!executePaymentResponse.ok) {
        throw new AppError_default(
          httpstatus11.INTERNAL_SERVER_ERROR,
          "Bkash Execute Payment Failed"
        );
      }
      const executePaymentResult = await executePaymentResponse.json();
      if (status === "success") {
        const payment = await prisma.payment.findUnique({
          where: {
            bkashPaymentId: paymentId
          }
        });
        if (!payment) {
          throw new AppError_default(httpstatus11.NOT_FOUND, "Payment Not Found");
        }
        if (payment.status === PaymentStatus.PAID) {
          return {
            message: "Payment Already Completed"
          };
        }
        await tx.payment.update({
          where: {
            id: payment.id
          },
          data: {
            status: PaymentStatus.PAID,
            bkashTrxId: executePaymentResult.trxID,
            paidAt: /* @__PURE__ */ new Date(),
            gatewayResponse: executePaymentResult
          }
        });
        const updatedShipment = await tx.shipment.update({
          where: {
            id: payment.shipmentId
          },
          include: {
            merchant: {
              include: {
                user: true
              }
            }
          },
          data: {
            status: ShipmentStatus.PAYMENT_CONFIRMED
          }
        });
        await tx.trackingEvent.create({
          data: {
            shipmentId: payment.shipmentId,
            status: ShipmentStatus.PAYMENT_CONFIRMED,
            description: "Shipment payment confirmed successfully."
          }
        });
        await tx.auditLog.create({
          data: {
            userId: updatedShipment.merchant.userId,
            action: "PAYMENT_COMPLETED",
            entity: "SHIPMENT",
            entityId: payment.shipmentId,
            metadata: {
              paymentId: payment.id,
              bkashPaymentId: paymentId,
              bkashTrxId: executePaymentResult.trxID
            }
          }
        });
        const templatePath = path5.join(
          process.cwd(),
          "src/app/template/ShipmentPaymentConfirmed.ejs"
        );
        const html = await ejs3.renderFile(templatePath, {
          merchantName: updatedShipment.merchant.user.name,
          trackingId: updatedShipment.trackingId,
          recipientName: updatedShipment.recipientName,
          deliveryFee: updatedShipment.deliveryFee.toString()
        });
        await nodemailer_default.sendMail({
          from: config_default.sender_email,
          to: updatedShipment.merchant.user.email,
          subject: "Shipment Confirmed Successfully",
          html
        });
        return {
          redirectUrl: `${config_default.frontend_url}/dashboard/my-shipments?status=success`
        };
      } else if (status === "failure") {
        await tx.payment.update({
          where: {
            bkashPaymentId: paymentId
          },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: executePaymentResult
          }
        });
        return {
          redirectUrl: `${config_default.frontend_url}/dashboard/my-shipments?status=false`
        };
      } else if (status === "cancel") {
        await tx.payment.update({
          where: {
            bkashPaymentId: paymentId
          },
          data: {
            status: PaymentStatus.CANCELLED,
            gatewayResponse: executePaymentResult
          }
        });
        return {
          redirectUrl: `${config_default.frontend_url}/dashboard/my-shipments?status=cancel`
        };
      } else {
        return {
          redirectUrl: `${config_default.frontend_url}/dashboard/my-shipments?error=payment_failed`
        };
      }
    },
    {
      maxWait: 1e4,
      timeout: 15e3
    }
  );
  return transactionResult;
};
var cancelShipment = async (shipmentId, payload, user) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findFirst({
      where: {
        id: shipmentId,
        merchant: {
          userId: user.userId
        }
      },
      include: {
        payments: {
          where: {
            status: PaymentStatus.PAID
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });
    if (!shipment) {
      throw new AppError_default(httpstatus11.NOT_FOUND, "Shipment not found.");
    }
    const cancellableStatuses = [
      ShipmentStatus.PAYMENT_PENDING,
      ShipmentStatus.PAYMENT_CONFIRMED
    ];
    if (!cancellableStatuses.includes(shipment.status)) {
      throw new AppError_default(
        httpstatus11.CONFLICT,
        `Shipment cannot be cancelled after ${shipment.status}.`
      );
    }
    if (shipment.status === ShipmentStatus.PAYMENT_PENDING) {
      const cancelledShipment2 = await tx.shipment.update({
        where: {
          id: shipment.id
        },
        data: {
          status: ShipmentStatus.CANCELLED,
          cancelledAt: /* @__PURE__ */ new Date(),
          cancellationReason: payload.reason
        }
      });
      await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: ShipmentStatus.CANCELLED,
          description: `Shipment cancelled by merchant. Reason: ${payload.reason}`,
          updatedBy: user.userId
        }
      });
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: "SHIPMENT_CANCELLED",
          entity: "SHIPMENT",
          entityId: shipment.id,
          metadata: {
            reason: payload.reason,
            previousStatus: ShipmentStatus.PAYMENT_PENDING
          }
        }
      });
      return {
        shipment: cancelledShipment2,
        payment: null
      };
    }
    const paidPayment = shipment.payments[0];
    if (!paidPayment) {
      throw new AppError_default(
        httpstatus11.CONFLICT,
        "Paid payment record not found for this shipment."
      );
    }
    if (!paidPayment.bkashPaymentId || !paidPayment.bkashTrxId) {
      throw new AppError_default(
        httpstatus11.CONFLICT,
        "Required bKash payment information is missing."
      );
    }
    const bkashIdToken = await getBkashIdToken();
    if (!bkashIdToken) {
      throw new AppError_default(
        httpstatus11.BAD_GATEWAY,
        "bKash access token not found."
      );
    }
    const refundResponse = await fetch(
      `${config_default.bkash_base_url}/tokenized/checkout/payment/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config_default.bkash_app_key
        },
        body: JSON.stringify({
          paymentID: paidPayment.bkashPaymentId,
          trxID: paidPayment.bkashTrxId,
          amount: Number(paidPayment.amount),
          sku: "SWIFTDROP-SHIPMENT",
          reason: payload.reason
        })
      }
    );
    const refundResult = await refundResponse.json();
    if (!refundResponse.ok) {
      throw new AppError_default(
        httpstatus11.BAD_GATEWAY,
        "bKash refund request failed."
      );
    }
    if (refundResult.statusCode !== "0000") {
      throw new AppError_default(
        httpstatus11.BAD_REQUEST,
        refundResult.statusMessage || "bKash refund failed."
      );
    }
    const refundAt = /* @__PURE__ */ new Date();
    const updatedPayment = await tx.payment.update({
      where: {
        id: paidPayment.id
      },
      data: {
        status: PaymentStatus.REFUNDED,
        refundTrxId: refundResult.refundTrxID,
        refundAmount: Number(paidPayment.amount),
        refundAt,
        refundReason: payload.reason,
        gatewayResponse: refundResult
      }
    });
    const cancelledShipment = await tx.shipment.update({
      where: {
        id: shipment.id
      },
      data: {
        status: ShipmentStatus.CANCELLED,
        cancelledAt: refundAt,
        cancellationReason: payload.reason
      }
    });
    await tx.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.CANCELLED,
        description: `Shipment cancelled and payment refunded. Reason: ${payload.reason}`,
        updatedBy: user.userId
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.userId,
        action: "SHIPMENT_CANCELLED",
        entity: "SHIPMENT",
        entityId: shipment.id,
        metadata: {
          reason: payload.reason,
          previousStatus: ShipmentStatus.PAYMENT_CONFIRMED,
          paymentId: paidPayment.id,
          refundTrxId: refundResult.refundTrxID,
          refundAmount: Number(paidPayment.amount)
        }
      }
    });
    return {
      shipment: cancelledShipment,
      payment: updatedPayment
    };
  });
  return transactionResult;
};
var getAllPaymentsAdmin = async (query, user) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!existingUser) {
    throw new AppError_default(
      httpstatus11.NOT_FOUND,
      "User Not Found"
    );
  }
  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError_default(
      httpstatus11.FORBIDDEN,
      "You are not authorized to access payment records."
    );
  }
  if (query.status) {
    addConditions.push({
      status: query.status
    });
  }
  const totalPayment = await prisma.payment.count({
    where: {
      AND: addConditions
    }
  });
  const allPayment = await prisma.payment.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      shipment: {
        select: {
          id: true,
          trackingId: true,
          recipientName: true,
          recipientPhone: true,
          status: true,
          merchant: {
            select: {
              businessName: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  return {
    data: allPayment,
    meta: {
      page,
      limit,
      total: totalPayment,
      totalPages: Math.ceil(totalPayment / limit)
    }
  };
};
var getSinglePaymentAdmin = async (paymentId, user) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!existingUser) {
    throw new AppError_default(
      httpstatus11.NOT_FOUND,
      "User Not Found"
    );
  }
  if (existingUser.role !== UserRole.ADMIN) {
    throw new AppError_default(
      httpstatus11.FORBIDDEN,
      "You are not authorized to access payment records."
    );
  }
  const singlePayment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    },
    include: {
      shipment: {
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              businessPhone: true,
              businessAddress: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              phone: true,
              vehicleType: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  if (!singlePayment) {
    throw new AppError_default(
      httpstatus11.NOT_FOUND,
      "Payment Not Found"
    );
  }
  return singlePayment;
};
var getAllPaymentMerchant = async (query, user) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const addConditions = [];
  const existingUser = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      merchantProfile: true
    }
  });
  if (!existingUser) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "User Not Found");
  }
  if (!existingUser.merchantProfile) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "Merchant Profile Not Found");
  }
  addConditions.push({
    shipment: {
      merchantId: existingUser.merchantProfile.id
    }
  });
  const totalPayment = await prisma.payment.count({
    where: {
      AND: addConditions
    }
  });
  const allPayment = await prisma.payment.findMany({
    where: {
      AND: addConditions
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      shipment: {
        select: {
          id: true,
          trackingId: true,
          recipientName: true,
          recipientPhone: true,
          status: true
        }
      }
    }
  });
  return {
    data: allPayment,
    meta: {
      page,
      limit,
      total: totalPayment,
      totalPages: Math.ceil(totalPayment / limit)
    }
  };
};
var getSinglePaymentMerchant = async (paymentId, user) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      merchantProfile: true
    }
  });
  if (!isUserExist) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "user  Not Found");
  }
  if (!isUserExist.merchantProfile) {
    throw new AppError_default(
      httpstatus11.NOT_FOUND,
      "Merchant Profile Not Found"
    );
  }
  const singlePayment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
      shipment: {
        merchantId: isUserExist.merchantProfile?.id
      }
    },
    include: {
      shipment: true
    }
  });
  if (!singlePayment) {
    throw new AppError_default(httpstatus11.NOT_FOUND, "Payment Not Found");
  }
  return singlePayment;
};
var paymentService = {
  initiateShipmentPayment,
  initiateShipmentPaymentCallback,
  cancelShipment,
  getAllPaymentsAdmin,
  getSinglePaymentAdmin,
  getAllPaymentMerchant,
  getSinglePaymentMerchant
};

// src/app/module/payment/payment.controller.ts
var initiateShipmentPayment2 = catchAsync(
  async (req, res, next) => {
    const payload = req.body;
    const user = req.user;
    const result = await paymentService.initiateShipmentPayment(payload, user);
    sendResponse(res, {
      statusCode: httpStatus4.OK,
      success: true,
      message: "initiate Shipment Payment successfully",
      data: result
    });
  }
);
var initiateShipmentPaymentCallback2 = catchAsync(
  async (req, res, next) => {
    const { redirectUrl } = await paymentService.initiateShipmentPaymentCallback(req.query);
    res.redirect(redirectUrl);
  }
);
var cancelShipment2 = catchAsync(async (req, res) => {
  const result = await paymentService.cancelShipment(
    req.params.shipmentId,
    req.body,
    req.user
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus4.OK,
    message: "Shipment cancelled successfully.",
    data: result
  });
});
var getAllPaymentMerchan = catchAsync(
  async (req, res) => {
    const result = await paymentService.getAllPaymentMerchant(
      req.query,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus4.OK,
      message: "Retrieved All Payment History Successfully",
      data: result
    });
  }
);
var getSinglePaymentMerchant2 = catchAsync(
  async (req, res) => {
    const result = await paymentService.getSinglePaymentMerchant(
      req.params.paymentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus4.OK,
      message: "Payment Retrieved Successfully",
      data: result
    });
  }
);
var getAllPaymentAdmin = catchAsync(
  async (req, res) => {
    const result = await paymentService.getAllPaymentsAdmin(
      req.query,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus4.OK,
      message: "Retrieved All Payment History Successfully",
      data: result
    });
  }
);
var getSinglePaymentAdmin2 = catchAsync(
  async (req, res) => {
    const result = await paymentService.getSinglePaymentAdmin(
      req.params.paymentId,
      req.user
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus4.OK,
      message: "Payment Retrieved Successfully",
      data: result
    });
  }
);
var paymentController = {
  initiateShipmentPayment: initiateShipmentPayment2,
  initiateShipmentPaymentCallback: initiateShipmentPaymentCallback2,
  cancelShipment: cancelShipment2,
  getAllPaymentAdmin,
  getSinglePaymentAdmin: getSinglePaymentAdmin2,
  getAllPaymentMerchan,
  getSinglePaymentMerchant: getSinglePaymentMerchant2
};

// src/app/module/payment/payment.validation.ts
import { z as z5 } from "zod";
var shipmentIdSchema = z5.object({
  shipmentId: z5.string().uuid("Invalid shipment ID")
});
var cancelShipmentSchema = z5.object({
  reason: z5.string().trim().min(5, "Cancellation reason must be at least 5 characters long").max(500, "Cancellation reason cannot exceed 500 characters")
});

// src/app/module/payment/payment.route.ts
var route = Router5();
route.post(
  "/initiate-shipment-payment",
  validationRequest(shipmentIdSchema),
  auth(UserRole.MERCHANT),
  paymentController.initiateShipmentPayment
);
route.get(
  "/bkash/payment/callback",
  paymentController.initiateShipmentPaymentCallback
);
route.post(
  "/cancel-shipment/:shipmentId",
  validationRequest(cancelShipmentSchema),
  auth(UserRole.MERCHANT),
  paymentController.cancelShipment
);
route.get(
  "/get-all-payment-admin",
  auth(UserRole.ADMIN),
  paymentController.getAllPaymentAdmin
);
route.get(
  "/get-single-payment-admin/:paymentId",
  auth(UserRole.ADMIN),
  paymentController.getSinglePaymentAdmin
);
route.get(
  "/get-all-payment-merchant",
  auth(UserRole.MERCHANT),
  paymentController.getAllPaymentMerchan
);
route.get(
  "/get-single-payment-merchant/:paymentId",
  auth(UserRole.MERCHANT),
  paymentController.getSinglePaymentMerchant
);
var PaymentRoutes = route;

// src/app.ts
var app = express();
app.use(
  cors({
    origin: config_default.frontend_url,
    credentials: true
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/rider", RiderRoutes);
app.use("/api/v1/shipment", ShipmentRouter);
app.use("/api/v1/payment", PaymentRoutes);
app.get("/", async (req, res) => {
  res.status(httpstatus12.OK).json({
    success: true,
    message: "Welcome to SwiftDrop \u2014 Merchant-Focused Courier & Last-Mile Logistics Platform "
  });
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seed.ts
import bcrypt3 from "bcryptjs";
import httpstatus13 from "http-status";
var seedTesterAdmin = async () => {
  try {
    const isTesterAdminExist = await prisma.user.findUnique({
      where: {
        email: config_default.tester_admin_email
      }
    });
    if (isTesterAdminExist) {
      console.log("Tester Admin Already Exists");
      return;
    }
    const name = config_default.tester_admin_name;
    const email = config_default.tester_admin_email;
    const password = config_default.tester_admin_password;
    if (!name || !email || !password) {
      throw new AppError_default(
        httpstatus13.INTERNAL_SERVER_ERROR,
        "Tester Admin Name,Email,Password Is Missing In ENV"
      );
    }
    const hashPassword = await bcrypt3.hash(
      password,
      Number(config_default.bcrypt_salt_rounds)
    );
    const testerAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        emailVerified: true,
        role: UserRole.ADMIN,
        needPasswordChange: false
      }
    });
    console.log("tester admin created : ", testerAdmin);
  } catch (error) {
    console.log("Error Seeding Tester Admin : ", error);
    await prisma.user.delete({
      where: {
        email: config_default.tester_admin_email
      }
    });
  }
};

// src/server.ts
var port = config_default.port;
var main = async () => {
  try {
    await prisma.$connect();
    console.log("connected to the database successfully");
    await redis_default.connect();
    console.log("Redis  Connected Successfully.");
    await nodemailer_default.verify();
    console.log("Nodemailer Conneted Successfully.");
    await seedTesterAdmin();
    console.log("Tester Admin Created Successfully.");
    app_default.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
main();
//# sourceMappingURL=server.js.map