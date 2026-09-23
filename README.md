
# SwiftDrop — Courier & Last-Mile Logistics API

SwiftDrop is a merchant-focused courier and last-mile logistics backend built to manage the complete shipment lifecycle — from shipment creation and payment to rider assignment, delivery tracking, and final delivery.

The project focuses on building a reliable, role-based logistics workflow with real payment integration, controlled shipment state transitions, transactional data consistency, and complete activity tracking.

## Problem

Courier operations involve multiple actors and business states. Without proper authorization and workflow control, issues such as unauthorized shipment access, invalid status changes, inconsistent payment records, and unclear delivery history can occur.

SwiftDrop addresses these challenges by centralizing shipment, payment, rider, and tracking operations into a structured REST API.

## Deployment

The backend is deployed on Vercel.

**Live API:** https://swiftdrop-logistics-api.vercel.app

## Core Features

- Merchant, Rider, and Admin role-based workflows
- Email/password and Google authentication
- OTP-based email verification
- Merchant shipment management
- Server-side delivery fee calculation
- Real bKash payment integration
- Payment retry and refund handling
- Admin rider assignment
- Rider-driven shipment lifecycle management
- Shipment tracking events
- Audit logging for important system actions
- Pagination and filtering
- Zod-based request validation
- Transaction-based critical operations
- Soft-delete and account status management
- Automated cleanup of expired rider applications

## Shipment Lifecycle

```text
PAYMENT_PENDING
       ↓
PAYMENT_CONFIRMED
       ↓
ASSIGNED
       ↓
ACCEPTED
       ↓
PICKED_UP
       ↓
IN_TRANSIT
       ↓
OUT_FOR_DELIVERY
       ↓
DELIVERED

Failed deliveries are handled separately through DELIVERY_FAILED.

The shipment status is controlled by business rules rather than allowing arbitrary status updates. This keeps the delivery workflow predictable and prevents invalid state transitions.

Payment Flow

Merchant courier fees are processed through the bKash Tokenized Checkout API.

Create Shipment
      ↓
PAYMENT_PENDING
      ↓
bKash Payment
      ↓
Payment Verification
      ↓
Transactional Update
      ├── Payment → PAID
      ├── Shipment → PAYMENT_CONFIRMED
      ├── Tracking Event
      └── Audit Log

COD is maintained separately from the courier service payment.

Architecture & Data Integrity

The backend follows a modular service-based architecture using Express, TypeScript, and Prisma.

Critical operations use database transactions to keep related records consistent across:

Shipments
Payments
Tracking events
Audit logs

The system also enforces ownership at the service layer, ensuring merchants can only access their shipments and riders can only operate on shipments assigned to them.

Tech Stack

Backend

Node.js
Express.js
TypeScript

Database

PostgreSQL
Prisma ORM

Authentication & Validation

JWT
bcrypt
Google Authentication
Zod

Payment

bKash Tokenized Checkout

Supporting Services

Redis
Cloudinary
Nodemailer
EJS
node-cron

Deployment

Vercel
Impact

SwiftDrop demonstrates a backend architecture built around real business workflows rather than basic CRUD operations.

The system provides:

Controlled and traceable shipment operations
Secure merchant and rider access
Reliable payment state management
Consistent shipment and payment data
Complete delivery history through tracking events
Accountability through audit logs
A foundation that can be extended with automated notifications, rider availability, COD settlement, and advanced logistics features
API

The API is versioned under:

/api/v1

The backend can be tested independently using Postman or Thunder Client.

Developer

Rakibul Hasan Rakib

Full Stack Developer | MERN | Next.js | TypeScript

Building scalable, business-driven web applications with modern backend architecture.