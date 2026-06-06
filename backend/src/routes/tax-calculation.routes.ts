import { Router } from "express";
import {
  calculateTaxAutoHandler,
  calculateTaxHandler,
  deleteTaxCalculationHandler,
  getTaxCalculationByIdHandler,
  getTaxCalculationSummaryHandler,
  listTaxCalculationsHandler
} from "../controllers/tax-calculation.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const taxCalculationRouter = Router();

taxCalculationRouter.use(requireAuth);

taxCalculationRouter.post("/calculate-auto", calculateTaxAutoHandler);
taxCalculationRouter.post("/calculate", calculateTaxHandler);
taxCalculationRouter.get("/summary", getTaxCalculationSummaryHandler);
taxCalculationRouter.get("/", listTaxCalculationsHandler);
taxCalculationRouter.get("/:id", getTaxCalculationByIdHandler);
taxCalculationRouter.delete("/:id", deleteTaxCalculationHandler);
