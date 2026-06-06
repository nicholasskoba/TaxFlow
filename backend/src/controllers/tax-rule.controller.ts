import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  createTaxRuleSchema,
  updateTaxRuleSchema
} from "../schemas/tax-rule.schema";
import {
  createTaxRule,
  deleteTaxRule,
  getTaxRuleById,
  listTaxRules,
  updateTaxRule
} from "../services/tax-rule.service";
import { createValidationError } from "../utils/validation";

export const listTaxRulesHandler: RequestHandler = async (_req, res, next) => {
  try {
    const taxRules = await listTaxRules();
    res.json({ taxRules });
  } catch (error) {
    next(error);
  }
};

export const getTaxRuleByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const taxRule = await getTaxRuleById(req.params.id);
    res.json({ taxRule });
  } catch (error) {
    next(error);
  }
};

export const createTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = createTaxRuleSchema.parse(req.body);
    const taxRule = await createTaxRule(data, req.user!.id);
    res.status(201).json({ taxRule });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const updateTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = updateTaxRuleSchema.parse(req.body);
    const taxRule = await updateTaxRule(req.params.id, data, req.user!.id);
    res.json({ taxRule });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const deleteTaxRuleHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteTaxRule(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


