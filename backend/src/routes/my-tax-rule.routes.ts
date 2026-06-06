import { Router } from "express";
import {
  createMyTaxRuleHandler,
  deleteMyTaxRuleHandler,
  listMyTaxRulesHandler,
  updateMyTaxRuleHandler
} from "../controllers/my-tax-rule.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const myTaxRuleRouter = Router();

myTaxRuleRouter.use(requireAuth);

myTaxRuleRouter.get("/", listMyTaxRulesHandler);
myTaxRuleRouter.post("/", createMyTaxRuleHandler);
myTaxRuleRouter.patch("/:id", updateMyTaxRuleHandler);
myTaxRuleRouter.delete("/:id", deleteMyTaxRuleHandler);
