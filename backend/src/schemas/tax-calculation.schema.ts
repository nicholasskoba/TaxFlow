import { z } from "zod";

const dateSchema = z.coerce.date();

export const calculateTaxSchema = z.object({
  incomeId: z.string().uuid(),
  taxRuleId: z.string().uuid()
});

export const calculateTaxAutoSchema = z.object({
  incomeId: z.string().uuid()
});

export const taxCalculationFiltersSchema = z.object({
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  taxRuleId: z.string().uuid().optional(),
  incomeId: z.string().uuid().optional()
});

export type CalculateTaxInput = z.infer<typeof calculateTaxSchema>;
export type CalculateTaxAutoInput = z.infer<typeof calculateTaxAutoSchema>;
export type TaxCalculationFiltersInput = z.infer<
  typeof taxCalculationFiltersSchema
>;
