import { Router } from "express";
import {
  createTaxRuleHandler,
  deleteTaxRuleHandler,
  getTaxRuleByIdHandler,
  listTaxRulesHandler,
  updateTaxRuleHandler
} from "../controllers/tax-rule.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

export const taxRuleRouter = Router();

taxRuleRouter.get("/", requireAuth, listTaxRulesHandler);
taxRuleRouter.get("/:id", requireAuth, getTaxRuleByIdHandler);
taxRuleRouter.post("/", requireAdmin, createTaxRuleHandler);
taxRuleRouter.patch("/:id", requireAdmin, updateTaxRuleHandler);
taxRuleRouter.delete("/:id", requireAdmin, deleteTaxRuleHandler);
