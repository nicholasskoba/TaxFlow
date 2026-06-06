import { Router } from "express";
import {
  exportMonthlyReportHandler,
  exportPeriodReportHandler,
  exportYearlyReportHandler,
  getMonthlyReportHandler,
  getPeriodReportHandler,
  getYearlyReportHandler
} from "../controllers/report.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get("/monthly/export", exportMonthlyReportHandler);
reportRouter.get("/monthly", getMonthlyReportHandler);
reportRouter.get("/yearly/export", exportYearlyReportHandler);
reportRouter.get("/yearly", getYearlyReportHandler);
reportRouter.get("/period/export", exportPeriodReportHandler);
reportRouter.get("/period", getPeriodReportHandler);
