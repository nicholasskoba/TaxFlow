import { z } from "zod";

const dateSchema = z.coerce.date();

export const auditLogFiltersSchema = z.object({
  action: z.string().trim().optional(),
  entity: z.string().trim().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50)
});

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;
