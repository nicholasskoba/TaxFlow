import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  createIncomeSchema,
  incomeFiltersSchema,
  updateIncomeSchema
} from "../schemas/income.schema";
import {
  createIncome,
  deleteIncome,
  getIncomeById,
  getIncomeSummary,
  listIncomes,
  updateIncome
} from "../services/income.service";
import { createValidationError } from "../utils/validation";

function getActor(req: Parameters<RequestHandler>[0]) {
  return {
    id: req.user!.id,
    role: req.user!.role
  };
}

export const listIncomesHandler: RequestHandler = async (req, res, next) => {
  try {
    const filters = incomeFiltersSchema.parse(req.query);
    const incomes = await listIncomes(getActor(req), filters);
    res.json({ incomes });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getIncomeSummaryHandler: RequestHandler = async (req, res, next) => {
  try {
    const summary = await getIncomeSummary(getActor(req));
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

export const getIncomeByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const income = await getIncomeById(req.params.id, getActor(req));
    res.json({ income });
  } catch (error) {
    next(error);
  }
};

export const createIncomeHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = createIncomeSchema.parse(req.body);
    const income = await createIncome(data, getActor(req));
    res.status(201).json({ income });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const updateIncomeHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = updateIncomeSchema.parse(req.body);
    const income = await updateIncome(req.params.id, data, getActor(req));
    res.json({ income });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const deleteIncomeHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteIncome(req.params.id, getActor(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
};


