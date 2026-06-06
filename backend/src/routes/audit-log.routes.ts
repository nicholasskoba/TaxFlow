import { Router } from "express";
import {
  getAuditLogByIdHandler,
  listAuditLogsHandler
} from "../controllers/audit-log.controller";
import { requireAdmin } from "../middleware/auth.middleware";

export const auditLogRouter = Router();

auditLogRouter.use(requireAdmin);

auditLogRouter.get("/", listAuditLogsHandler);
auditLogRouter.get("/:id", getAuditLogByIdHandler);
