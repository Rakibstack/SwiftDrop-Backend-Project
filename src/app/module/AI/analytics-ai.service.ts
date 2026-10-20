import { generateAIText } from "../../../services/AI/gemini.service";
import { analyticService } from "../analytics/analytics.service";

const generateAdminAIInsights = async () => {
  // Reuse your existing trusted analytics data.
  const analytics = await analyticService.getAdminAnalytics();

  const { overview, revenue } = analytics;

  // Calculate facts in code, not inside the AI model.
  const cancellationRate =
    overview.totalShipments > 0
      ? Number(
          (
            (overview.cancelledShipments / overview.totalShipments) *
            100
          ).toFixed(1),
        )
      : 0;

  const deliveryRate =
    overview.totalShipments > 0
      ? Number(
          (
            (overview.deliveredShipments / overview.totalShipments) *
            100
          ).toFixed(1),
        )
      : 0;

  const paymentPendingRate =
    overview.totalShipments > 0
      ? Number(
          // This is specifically PAYMENT_PENDING, not delivery pending.
          ((overview.pendingShipments / overview.totalShipments) * 100).toFixed(
            1,
          ),
        )
      : 0;

  const metrics = {
    overview,
    revenue: {
      totalPaidAmount: revenue.totalPaidAmount,
      totalPaidTransactions: revenue.totalPaidTransactions,
      todayPaidAmount: revenue.todayPaidAmount,
      todayPaidTransactions: revenue.todayPaidTransactions,
      trend: revenue.trend,
    },
    calculatedMetrics: {
      cancellationRatePercent: cancellationRate,
      deliveredSharePercent: deliveryRate,
      paymentPendingSharePercent: paymentPendingRate,
    },
  };

  const insights = await generateAIText({
    systemInstruction: `
      You are SwiftDrop's logistics analytics assistant for administrators.

      Analyze only the supplied JSON metrics.
      Never invent numbers, causes, events, or business facts.
      Distinguish payment-pending shipments from delivery delays.
      A zero-revenue day alone is not proof of an anomaly.
      If the dataset is small, explain that conclusions are limited.
      Provide:
      1. A short overall summary.
      2. Two or three observations grounded in the data.
      3. Up to three practical recommendations.
      Keep the language clear, concise, and professional.
      If the data does not support a conclusion, say so.
    `,
    prompt: `
      Analyze the following SwiftDrop analytics data.

      Return a concise report with the headings:
      Overall Summary
      Key Observations
      Recommended Actions

      Analytics JSON:
      ${JSON.stringify(metrics)}
    `,
  });

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    insights,
  };
};

export const analyticsAIService = {
  generateAdminAIInsights,
};
