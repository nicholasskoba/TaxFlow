import { Router } from "express";
import {
  createIncomeCategoryHandler,
  deleteIncomeCategoryHandler,
  listIncomeCategories,
  updateIncomeCategoryHandler
} from "../controllers/income-category.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

export const incomeCategoryRouter = Router();

incomeCategoryRouter.get("/", requireAuth, listIncomeCategories);
incomeCategoryRouter.post("/", requireAdmin, createIncomeCategoryHandler);
incomeCategoryRouter.patch("/:id", requireAdmin, updateIncomeCategoryHandler);
incomeCategoryRouter.delete("/:id", requireAdmin, deleteIncomeCategoryHandler);
