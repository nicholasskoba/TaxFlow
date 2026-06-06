import { IncomeType, TaxRuleType } from "@prisma/client";
import { z } from "zod";

const rateSchema = z.coerce
  .number()
  .positive()
  .max(100)
  .transform((value) => value.toString());

const optionalDecimalSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce
    .number()
    .positive()
    .transform((value) => value.toString())
    .optional()
    .nullable()
);

const taxRuleFields = {
  name: z.string().trim().min(2),
  rate: rateSchema,
  incomeType: z.nativeEnum(IncomeType),
  ruleType: z.nativeEnum(TaxRuleType).default(TaxRuleType.FIXED),
  threshold: optionalDecimalSchema,
  extraRate: optionalDecimalSchema.refine(
    (value) => value === undefined || value === null || Number(value) <= 100,
    "extraRate must be less than or equal to 100"
  ),
  isActive: z.boolean().default(true)
};

export const createTaxRuleSchema = z
  .object(taxRuleFields)
  .superRefine((data, context) => {
    if (data.ruleType !== TaxRuleType.PROGRESSIVE) {
      return;
    }

    if (!data.threshold) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["threshold"],
        message: "Threshold is required for progressive tax rules"
      });
    }

    if (!data.extraRate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["extraRate"],
        message: "Extra rate is required for progressive tax rules"
      });
    }
  });

export const updateTaxRuleSchema = z
  .object({
    name: taxRuleFields.name.optional(),
    rate: taxRuleFields.rate.optional(),
    incomeType: taxRuleFields.incomeType.optional(),
    ruleType: z.nativeEnum(TaxRuleType).optional(),
    threshold: optionalDecimalSchema,
    extraRate: optionalDecimalSchema.refine(
      (value) => value === undefined || value === null || Number(value) <= 100,
      "extraRate must be less than or equal to 100"
    ),
    isActive: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

export type CreateTaxRuleInput = z.infer<typeof createTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof updateTaxRuleSchema>;
