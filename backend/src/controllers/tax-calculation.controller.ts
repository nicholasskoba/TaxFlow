import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  calculateTaxAutoSchema,
  calculateTaxSchema,
  taxCalculationFiltersSchema
} from "../schemas/tax-calculation.schema";
import {
  calculateTaxAuto,
  calculateTax,
  deleteTaxCalculation,
  getTaxCalculationById,
  getTaxCalculationSummary,
  listTaxCalculations
} from "../services/tax-calculation.service";
import { createValidationError } from "../utils/validation";

function getActor(req: Parameters<RequestHandler>[0]) {
  return {
    id: req.user!.id,
    role: req.user!.role
  };
}

export const calculateTaxHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = calculateTaxSchema.parse(req.body);
    const taxCalculation = await calculateTax(data, getActor(req));
    res.status(201).json({ taxCalculation });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const calculateTaxAutoHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = calculateTaxAutoSchema.parse(req.body);
    const taxCalculation = await calculateTaxAuto(data, getActor(req));
    res.status(201).json({ taxCalculation });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const listTaxCalculationsHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const filters = taxCalculationFiltersSchema.parse(req.query);
    const taxCalculations = await listTaxCalculations(getActor(req), filters);
    res.json({ taxCalculations });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getTaxCalculationSummaryHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const summary = await getTaxCalculationSummary(getActor(req));
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

export const getTaxCalculationByIdHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const taxCalculation = await getTaxCalculationById(req.params.id, getActor(req));
    res.json({ taxCalculation });
  } catch (error) {
    next(error);
  }
};

export const deleteTaxCalculationHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteTaxCalculation(req.params.id, getActor(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
};


