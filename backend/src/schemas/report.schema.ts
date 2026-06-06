import { z } from "zod";
import { ApiError } from "../utils/ApiError";

const currentYear = new Date().getFullYear();

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12)
});

export const yearlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100)
});

export const periodReportQuerySchema = z
  .object({
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date()
  })
  .refine((value) => value.dateFrom <= value.dateTo, {
    message: "dateFrom must be earlier than or equal to dateTo",
    path: ["dateTo"]
  });

export function ensureReasonableReportYear(year = currentYear) {
  if (year < 2000 || year > 2100) {
    throw new ApiError(400, "Year must be between 2000 and 2100");
  }
}

export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;
export type YearlyReportQuery = z.infer<typeof yearlyReportQuerySchema>;
export type PeriodReportQuery = z.infer<typeof periodReportQuerySchema>;
