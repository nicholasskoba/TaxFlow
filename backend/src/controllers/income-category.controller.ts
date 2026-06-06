import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  createIncomeCategorySchema,
  updateIncomeCategorySchema
} from "../schemas/income-category.schema";
import {
  createIncomeCategory,
  deleteIncomeCategory,
  getIncomeCategories,
  updateIncomeCategory
} from "../services/income-category.service";
import { createValidationError } from "../utils/validation";

export const listIncomeCategories: RequestHandler = async (_req, res, next) => {
  try {
    const categories = await getIncomeCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createIncomeCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = createIncomeCategorySchema.parse(req.body);
    const category = await createIncomeCategory(data, req.user!.id);
    res.status(201).json({ category });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const updateIncomeCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = updateIncomeCategorySchema.parse(req.body);
    const category = await updateIncomeCategory(req.params.id, data, req.user!.id);
    res.json({ category });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const deleteIncomeCategoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteIncomeCategory(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};


