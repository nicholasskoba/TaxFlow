import { RequestHandler } from "express";
import { ZodError } from "zod";
import { auditLogFiltersSchema } from "../schemas/audit-log.schema";
import { getAuditLogById, listAuditLogs } from "../services/audit-log.service";
import { createValidationError } from "../utils/validation";

export const listAuditLogsHandler: RequestHandler = async (req, res, next) => {
  try {
    const filters = auditLogFiltersSchema.parse(req.query);
    const auditLogs = await listAuditLogs(filters);
    res.json({ auditLogs });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getAuditLogByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const auditLog = await getAuditLogById(req.params.id);
    res.json({ auditLog });
  } catch (error) {
    next(error);
  }
};
