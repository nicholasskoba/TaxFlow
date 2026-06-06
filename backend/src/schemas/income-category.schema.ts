import { IncomeType } from "@prisma/client";
import { z } from "zod";

export const createIncomeCategorySchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  incomeType: z.nativeEnum(IncomeType).default(IncomeType.OTHER)
});

export const updateIncomeCategorySchema = createIncomeCategorySchema.partial();

export type CreateIncomeCategoryInput = z.infer<typeof createIncomeCategorySchema>;
export type UpdateIncomeCategoryInput = z.infer<typeof updateIncomeCategorySchema>;
