import { z } from "zod";

export const askAIQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(1000, "Question must not exceed 1000 characters"),
  trackingId: z.string().trim().min(1).max(100).optional(),
});

export type AskAIQuestionInput = z.infer<typeof askAIQuestionSchema>;
