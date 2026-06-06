import { z } from "zod";

const amountSchema = z.coerce
  .number()
  .positive()
  .transform((value) => value.toString());

const dateSchema = z.coerce.date();

export const createIncomeSchema = z.object({
  categoryId: z.string().uuid(),
  amount: amountSchema,
  receivedAt: dateSchema,
  description: z.string().trim().optional().nullable()
});

export const updateIncomeSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: amountSchema.optional(),
  receivedAt: dateSchema.optional(),
  description: z.string().trim().optional().nullable()
});

export const incomeFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  search: z.string().trim().optional()
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type IncomeFiltersInput = z.infer<typeof incomeFiltersSchema>;
