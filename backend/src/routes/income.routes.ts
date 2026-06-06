import { Router } from "express";
import {
  createIncomeHandler,
  deleteIncomeHandler,
  getIncomeByIdHandler,
  getIncomeSummaryHandler,
  listIncomesHandler,
  updateIncomeHandler
} from "../controllers/income.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const incomeRouter = Router();

incomeRouter.use(requireAuth);

incomeRouter.get("/summary", getIncomeSummaryHandler);
incomeRouter.get("/", listIncomesHandler);
incomeRouter.post("/", createIncomeHandler);
incomeRouter.get("/:id", getIncomeByIdHandler);
incomeRouter.patch("/:id", updateIncomeHandler);
incomeRouter.delete("/:id", deleteIncomeHandler);
