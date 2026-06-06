import { RequestHandler } from "express";
import { ZodError } from "zod";
import { updateUserSchema, userFiltersSchema } from "../schemas/user.schema";
import {
  getUserByIdForAdmin,
  listUsers,
  updateUser
} from "../services/user.service";
import { createValidationError } from "../utils/validation";

function getActor(req: Parameters<RequestHandler>[0]) {
  return {
    id: req.user!.id,
    role: req.user!.role
  };
}

export const listUsersHandler: RequestHandler = async (req, res, next) => {
  try {
    const filters = userFiltersSchema.parse(req.query);
    const users = await listUsers(filters);
    res.json({ users });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getUserByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await getUserByIdForAdmin(req.params.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await updateUser(req.params.id, data, getActor(req));
    res.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};
