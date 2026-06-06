import { Router } from "express";
import { getDashboardSummaryHandler } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", getDashboardSummaryHandler);
