import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  createTaxRuleSchema,
  updateTaxRuleSchema
} from "../schemas/tax-rule.schema";
import {
  createMyTaxRule,
  deleteMyTaxRule,
  listMyTaxRules,
  updateMyTaxRule
} from "../services/tax-rule.service";
import { createValidationError } from "../utils/validation";

export const listMyTaxRulesHandler: RequestHandler = async (req, res, next) => {
  try {
    const taxRules = await listMyTaxRules(req.user!.id);
    res.json({ taxRules });
  } catch (error) {
    next(error);
  }
};

export const createMyTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = createTaxRuleSchema.parse(req.body);
    const taxRule = await createMyTaxRule(data, req.user!.id);
    res.status(201).json({ taxRule });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const updateMyTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = updateTaxRuleSchema.parse(req.body);
    const taxRule = await updateMyTaxRule(req.params.id, data, req.user!.id);
    res.json({ taxRule });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const deleteMyTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteMyTaxRule(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
