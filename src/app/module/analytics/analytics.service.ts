import {
  PaymentStatus,
  RiderStatus,
  ShipmentStatus,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";

import { prisma } from "../../lib/prisma";

const getAdminAnalytics = async () => {
  const now = new Date();

  // Start of today
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Last 7 days, including today
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    totalUsers,
    activeUsers,
    activeRiders,
    totalShipments,
    pendingShipments,
    confirmedShipments,
    cancelledShipments,
    deliveredShipments,
    recentShipments,
    recentActivities,
    revenueSummary,
    todayShipments,
    todayPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        isDeleted: false,
      },
    }),

    // Active non-deleted users
    prisma.user.count({
      where: {
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
    }),

    // Active riders
    prisma.user.count({
      where: {
        role: UserRole.RIDER,
        isDeleted: false,
        status: UserStatus.ACTIVE,
        riderProfile: {
          is: {
            status: RiderStatus.ACTIVE,
          },
        },
      },
    }),

    // Total shipments
    prisma.shipment.count(),

    // Payment pending shipments
    prisma.shipment.count({
      where: {
        status: ShipmentStatus.PAYMENT_PENDING,
      },
    }),

    // Payment confirmed shipments
    prisma.shipment.count({
      where: {
        status: ShipmentStatus.PAYMENT_CONFIRMED,
      },
    }),

    // Cancelled shipments
    prisma.shipment.count({
      where: {
        status: ShipmentStatus.CANCELLED,
      },
    }),

    // Delivered shipments
    prisma.shipment.count({
      where: {
        status: ShipmentStatus.DELIVERED,
      },
    }),

    // Latest shipments
    prisma.shipment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        senderName: true,
        deliveryFee: true,
        recipientAddress: true,
        status: true,
        createdAt: true,
      },
    }),

    // Latest tracking activities
    prisma.trackingEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        shipmentId: true,
      },
    }),

    // Revenue summary for all paid payments
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.PAID,
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),

    // Shipments created today
    prisma.shipment.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: now,
        },
      },
    }),

    // Payments received today
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.PAID,
        createdAt: {
          gte: startOfToday,
          lte: now,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),

    // Paid payments during the last 7 days
    prisma.payment.findMany({
      where: {
        status: PaymentStatus.PAID,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  // Build a revenue chart dataset with seven calendar days.
  const revenueByDay = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    const day = new Date(sevenDaysAgo);
    day.setDate(sevenDaysAgo.getDate() + i);

    const dateKey = [
      day.getFullYear(),
      String(day.getMonth() + 1).padStart(2, "0"),
      String(day.getDate()).padStart(2, "0"),
    ].join("-");

    revenueByDay.set(dateKey, 0);
  }

  for (const payment of recentPayments) {
    const date = new Date(payment.createdAt);

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    if (revenueByDay.has(dateKey)) {
      revenueByDay.set(
        dateKey,
        (revenueByDay.get(dateKey) ?? 0) + Number(payment.amount),
      );
    }
  }

  const revenueTrend = Array.from(revenueByDay, ([date, revenue]) => ({
    date,
    revenue,
  }));

  return {
    overview: {
      totalUsers,
      activeUsers,
      activeRiders,
      totalShipments,
      pendingShipments,
      confirmedShipments,
      cancelledShipments,
      deliveredShipments,
      todayShipments,
    },

    revenue: {
      totalPaidAmount: Number(revenueSummary._sum.amount ?? 0),
      totalPaidTransactions: revenueSummary._count._all,
      todayPaidAmount: Number(todayPayments._sum.amount ?? 0),
      todayPaidTransactions: todayPayments._count._all,
      trend: revenueTrend,
    },

    recentShipments,
    recentActivities,
  };
};

export const analyticService = {
  getAdminAnalytics,
};
